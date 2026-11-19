"""Échantillon commun de séries temporelles (ticket #14).

Deux étapes, lancées depuis le dossier ia/ :

    python -m pipeline.echantillon telecharger-gdelt
    python -m pipeline.echantillon construire

`telecharger-gdelt` enregistre la réponse brute de l'API DOC de GDELT dans
docs/data/brut/gdelt/. Les exports Google Trends se font à la main (voir
docs/data/echantillon.md) et se déposent dans docs/data/brut/google_trends/.

`construire` lit ces fichiers bruts et écrit docs/data/echantillon.csv : une
ligne par tendance, source, zone, mois et mesure. Bibliothèque standard
uniquement, pour ne pas ajouter de dépendance.

Sources à citer : The GDELT Project (https://www.gdeltproject.org/), API DOC
2.0, et Google Trends (https://trends.google.com/).
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
DOSSIER_BRUT = RACINE / "docs" / "data" / "brut"
FICHIER_SORTIE = RACINE / "docs" / "data" / "echantillon.csv"

DEBUT = "2017-01"
FIN = "2025-12"

GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc"
# GDELT demande au plus une requête toutes les 5 secondes, et renvoie 429
# bien au-delà en pratique : on attend plus longtemps.
GDELT_PAUSE_S = 20

COLONNES = [
    "tendance",
    "terme",
    "source",
    "zone",
    "mois",
    "mesure",
    "valeur",
    "unite",
    "fichier_brut",
    "date_extraction",
]


@dataclass(frozen=True)
class Tendance:
    id: str
    libelle: str
    requete_gdelt: str
    terme_google_trends: str


# Trois cas contrastés, pris parmi les candidats au rejeu (pic entre 2017 et
# 2024) : deux pressentis éphémères, un pressenti durable.
TENDANCES = [
    Tendance("dalgona", "Café dalgona", '"dalgona coffee"', "dalgona coffee"),
    Tendance("lait-avoine", "Lait d'avoine", '"oat milk"', "oat milk"),
    Tendance("pates-feta", "Pâtes à la feta", '"feta pasta"', "feta pasta"),
]

UNITES = {
    "articles": "nombre d'articles",
    "part_articles": "articles par million d'articles suivis",
    "interet_recherche": "indice 0-100 relatif à l'export",
}

NOM_FICHIER = re.compile(r"^(?P<prefixe>.+)_(?P<date>\d{4}-\d{2}-\d{2})\.csv$")


def url_gdelt(requete: str) -> str:
    parametres = {
        "query": requete,
        "mode": "timelinevolraw",
        "format": "csv",
        "startdatetime": DEBUT.replace("-", "") + "01000000",
        "enddatetime": "20251231235959",
    }
    return GDELT_URL + "?" + urllib.parse.urlencode(parametres)


def appeler_gdelt(url: str, essais: int = 4) -> str:
    """Appelle GDELT, en attendant de plus en plus longtemps après un 429."""
    requete = urllib.request.Request(
        url, headers={"User-Agent": "hackathon-echantillon/1.0"}
    )
    for essai in range(essais):
        try:
            with urllib.request.urlopen(requete, timeout=120) as reponse:
                return reponse.read().decode("utf-8-sig")
        except urllib.error.HTTPError as erreur:
            if erreur.code != 429 or essai == essais - 1:
                raise
            attente = GDELT_PAUSE_S * 2 ** (essai + 1)
            print(f"GDELT : 429, nouvel essai dans {attente} s")
            time.sleep(attente)
    raise AssertionError("inaccessible")


def telecharger_gdelt(ids: list[str] | None = None) -> list[Path]:
    jour = date.today().isoformat()
    dossier = DOSSIER_BRUT / "gdelt"
    dossier.mkdir(parents=True, exist_ok=True)
    choisies = [t for t in TENDANCES if not ids or t.id in ids]
    ecrits = []
    for i, tendance in enumerate(choisies):
        if i:
            time.sleep(GDELT_PAUSE_S)
        contenu = appeler_gdelt(url_gdelt(tendance.requete_gdelt))
        if not contenu.startswith("Date,"):
            raise RuntimeError(
                f"Réponse GDELT inattendue pour {tendance.id} : {contenu[:200]!r}"
            )
        chemin = dossier / f"{tendance.id}_{jour}.csv"
        chemin.write_text(contenu, encoding="utf-8", newline="")
        ecrits.append(chemin)
        print(f"GDELT {tendance.id} : {chemin_relatif(chemin)}")
    return ecrits


def chemin_relatif(chemin: Path) -> str:
    try:
        return chemin.resolve().relative_to(RACINE).as_posix()
    except ValueError:
        return chemin.name


def mois_dans_la_fenetre(mois: str) -> bool:
    return DEBUT <= mois <= FIN


def lire_gdelt(chemin: Path, tendance: Tendance, date_extraction: str) -> list[dict]:
    """Agrège par mois les comptes quotidiens de l'API DOC (timelinevolraw)."""
    articles: dict[str, int] = defaultdict(int)
    total: dict[str, int] = defaultdict(int)
    with chemin.open(encoding="utf-8-sig", newline="") as f:
        for ligne in csv.DictReader(f):
            mois = ligne["Date"][:7]
            if not mois_dans_la_fenetre(mois):
                continue
            valeur = int(ligne["Value"])
            if ligne["Series"] == "Article Count":
                articles[mois] += valeur
            elif ligne["Series"] == "Total Monitored Articles":
                total[mois] += valeur
    lignes = []
    for mois in sorted(total):
        commun = {
            "tendance": tendance.id,
            "terme": tendance.requete_gdelt.strip('"'),
            "source": "gdelt",
            "zone": "MONDE",
            "mois": mois,
            "fichier_brut": chemin_relatif(chemin),
            "date_extraction": date_extraction,
        }
        part = articles[mois] / total[mois] * 1_000_000 if total[mois] else 0.0
        lignes.append({**commun, "mesure": "articles", "valeur": articles[mois]})
        lignes.append({**commun, "mesure": "part_articles", "valeur": round(part, 4)})
    return lignes


ENTETES_TEMPS = {"mois", "month", "semaine", "week", "jour", "day", "time", "date"}
ZONES = {
    "dans le monde": "MONDE",
    "dans tous les pays": "MONDE",
    "worldwide": "MONDE",
    "france": "FR",
}


def valeur_trends(texte: str) -> int:
    # Google écrit « <1 » ou « < 1 » (espace insécable) selon la langue.
    texte = "".join(texte.split())
    if texte == "<1":
        return 0
    return int(texte)


def colonne_trends(entete: str, zone_par_defaut: str) -> tuple[str, str]:
    """« oat milk: (France) » donne ("oat milk", "FR")."""
    terme, _, reste = entete.partition(":")
    zone_lue = reste.strip().strip("()").strip().lower()
    return terme.strip(), ZONES.get(zone_lue, zone_par_defaut)


def lire_google_trends(
    chemin: Path, zone_par_defaut: str, date_extraction: str
) -> list[dict]:
    """Lit un export « Évolution de l'intérêt pour la recherche ».

    Les semaines sont ramenées au mois par la moyenne. Un terme absent de
    TENDANCES est gardé avec la tendance « ancrage ».
    """
    with chemin.open(encoding="utf-8-sig", newline="") as f:
        lignes = list(csv.reader(f))
    debut = next(
        (i for i, l in enumerate(lignes) if l and l[0].strip().lower() in ENTETES_TEMPS),
        None,
    )
    if debut is None:
        raise ValueError(f"{chemin.name} : ligne d'en-tête introuvable")
    colonnes = [colonne_trends(e, zone_par_defaut) for e in lignes[debut][1:]]
    par_terme = {t.terme_google_trends.lower(): t.id for t in TENDANCES}

    sommes: dict[tuple[int, str], list[int]] = defaultdict(list)
    for ligne in lignes[debut + 1 :]:
        if not ligne or not ligne[0].strip():
            continue
        jour = ligne[0].strip()
        if not re.match(r"^\d{4}-\d{2}(-\d{2})?$", jour):
            raise ValueError(f"{chemin.name} : date non reconnue {jour!r}")
        mois = jour[:7]
        if not mois_dans_la_fenetre(mois):
            continue
        for j, cellule in enumerate(ligne[1:]):
            sommes[(j, mois)].append(valeur_trends(cellule))

    resultat = []
    for (j, mois), valeurs in sorted(sommes.items(), key=lambda c: (c[0][0], c[0][1])):
        terme, zone = colonnes[j]
        resultat.append(
            {
                "tendance": par_terme.get(terme.lower(), "ancrage"),
                "terme": terme,
                "source": "google_trends",
                "zone": zone,
                "mois": mois,
                "mesure": "interet_recherche",
                "valeur": round(sum(valeurs) / len(valeurs), 2),
                "fichier_brut": chemin_relatif(chemin),
                "date_extraction": date_extraction,
            }
        )
    return resultat


def plus_recents(dossier: Path) -> dict[str, tuple[Path, str]]:
    """Pour chaque préfixe de fichier, garde l'extraction la plus récente."""
    choisis: dict[str, tuple[Path, str]] = {}
    for chemin in sorted(dossier.glob("*.csv")):
        nom = NOM_FICHIER.match(chemin.name)
        if not nom:
            raise ValueError(
                f"{chemin.name} : nom attendu <prefixe>_<AAAA-MM-JJ>.csv"
            )
        prefixe, jour = nom["prefixe"], nom["date"]
        if prefixe not in choisis or jour > choisis[prefixe][1]:
            choisis[prefixe] = (chemin, jour)
    return choisis


def construire() -> list[dict]:
    lignes: list[dict] = []
    par_id = {t.id: t for t in TENDANCES}

    gdelt = DOSSIER_BRUT / "gdelt"
    if gdelt.is_dir():
        for prefixe, (chemin, jour) in plus_recents(gdelt).items():
            if prefixe not in par_id:
                raise ValueError(f"{chemin.name} : tendance inconnue {prefixe!r}")
            lignes += lire_gdelt(chemin, par_id[prefixe], jour)

    trends = DOSSIER_BRUT / "google_trends"
    if trends.is_dir():
        for prefixe, (chemin, jour) in plus_recents(trends).items():
            lignes += lire_google_trends(chemin, prefixe.upper(), jour)

    for ligne in lignes:
        ligne["unite"] = UNITES[ligne["mesure"]]
    lignes.sort(key=lambda l: (l["tendance"], l["source"], l["zone"], l["mesure"], l["mois"]))
    return lignes


def ecrire(lignes: list[dict], chemin: Path = FICHIER_SORTIE) -> None:
    chemin.parent.mkdir(parents=True, exist_ok=True)
    with chemin.open("w", encoding="utf-8", newline="") as f:
        ecrivain = csv.DictWriter(f, fieldnames=COLONNES, lineterminator="\n")
        ecrivain.writeheader()
        ecrivain.writerows(lignes)


def tous_les_mois() -> list[str]:
    annee, mois = map(int, DEBUT.split("-"))
    fin = tuple(map(int, FIN.split("-")))
    resultat = []
    while (annee, mois) <= fin:
        resultat.append(f"{annee:04d}-{mois:02d}")
        annee, mois = (annee + 1, 1) if mois == 12 else (annee, mois + 1)
    return resultat


def controler(lignes: list[dict]) -> list[str]:
    """Renvoie la liste des anomalies : mois manquants, valeurs hors bornes."""
    anomalies = []
    attendus = set(tous_les_mois())
    series: dict[tuple, set[str]] = defaultdict(set)
    for l in lignes:
        series[(l["tendance"], l["terme"], l["source"], l["zone"], l["mesure"])].add(l["mois"])
        v = float(l["valeur"])
        if v < 0 or (l["mesure"] == "interet_recherche" and v > 100):
            anomalies.append(f"valeur hors bornes : {l}")
    for cle, mois in series.items():
        manquants = sorted(attendus - mois)
        if manquants:
            anomalies.append(f"{cle} : {len(manquants)} mois manquants, dont {manquants[:3]}")
    return anomalies


def main(arguments: list[str] | None = None) -> int:
    analyseur = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    analyseur.add_argument("etape", choices=["telecharger-gdelt", "construire"])
    analyseur.add_argument(
        "tendances", nargs="*", help="identifiants à télécharger (toutes par défaut)"
    )
    options = analyseur.parse_args(arguments)
    if options.etape == "telecharger-gdelt":
        telecharger_gdelt(options.tendances)
        return 0
    lignes = construire()
    ecrire(lignes)
    print(f"{len(lignes)} lignes écrites dans {FICHIER_SORTIE.relative_to(RACINE)}")
    anomalies = controler(lignes)
    for anomalie in anomalies:
        print("ANOMALIE", anomalie)
    return 1 if anomalies else 0


if __name__ == "__main__":
    sys.exit(main())
