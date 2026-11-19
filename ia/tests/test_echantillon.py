"""Tests des lecteurs de l'échantillon (#14), sans appel réseau."""

from pipeline.echantillon import (
    TENDANCES,
    controler,
    lire_gdelt,
    lire_google_trends,
    plus_recents,
    url_gdelt,
)

DALGONA = TENDANCES[0]

GDELT_BRUT = """\
Date,Series,Value
2016-12-31,Article Count,9
2016-12-31,Total Monitored Articles,100
2020-04-01,Article Count,3
2020-04-01,Total Monitored Articles,1000000
2020-04-02,Article Count,1
2020-04-02,Total Monitored Articles,1000000
2020-05-01,Article Count,0
2020-05-01,Total Monitored Articles,500000
"""

TRENDS_MENSUEL = """\
Catégorie : Toutes catégories

Mois,dalgona coffee: (Dans le monde),café: (Dans le monde)
2020-03,12,80
2020-04,100,81
2020-05,<1,79
"""

TRENDS_HEBDO = """\
Category: All categories

Week,oat milk: (France)
2021-05-02,40
2021-05-09,<1
2021-05-16,20
2021-06-06,10
"""


def test_gdelt_agrege_par_mois_et_rapporte_au_total(tmp_path):
    chemin = tmp_path / "dalgona_2026-11-15.csv"
    chemin.write_text(GDELT_BRUT, encoding="utf-8")

    lignes = lire_gdelt(chemin, DALGONA, "2026-11-15")
    valeurs = {(l["mois"], l["mesure"]): l["valeur"] for l in lignes}

    assert valeurs[("2020-04", "articles")] == 4
    assert valeurs[("2020-04", "part_articles")] == 2.0  # 4 sur 2 millions
    assert valeurs[("2020-05", "part_articles")] == 0.0
    assert "2016-12" not in {l["mois"] for l in lignes}  # hors fenêtre
    assert {l["zone"] for l in lignes} == {"MONDE"}
    assert {l["terme"] for l in lignes} == {"dalgona coffee"}


def test_trends_mensuel_lit_les_termes_et_remplace_moins_de_un(tmp_path):
    chemin = tmp_path / "monde_2026-11-15.csv"
    chemin.write_text(TRENDS_MENSUEL, encoding="utf-8-sig")

    lignes = lire_google_trends(chemin, "MONDE", "2026-11-15")
    dalgona = {l["mois"]: l["valeur"] for l in lignes if l["tendance"] == "dalgona"}
    ancrage = [l for l in lignes if l["tendance"] == "ancrage"]

    assert dalgona == {"2020-03": 12, "2020-04": 100, "2020-05": 0}
    assert {l["terme"] for l in ancrage} == {"café"}
    assert {l["zone"] for l in lignes} == {"MONDE"}


def test_trends_accepte_moins_de_un_avec_espace_et_tous_les_pays(tmp_path):
    chemin = tmp_path / "monde_2026-11-16.csv"
    chemin.write_text(
        "Catégorie : Toutes catégories\n\n"
        "Mois,feta pasta: (Dans tous les pays)\n"
        "2021-01,<\xa01\n"
        "2021-02,15\n",
        encoding="utf-8",
    )

    lignes = lire_google_trends(chemin, "AUTRE", "2026-11-16")

    assert [l["valeur"] for l in lignes] == [0, 15]
    assert {l["zone"] for l in lignes} == {"MONDE"}
    assert {l["tendance"] for l in lignes} == {"pates-feta"}


def test_trends_hebdo_ramene_au_mois_par_la_moyenne(tmp_path):
    chemin = tmp_path / "fr_2026-11-15.csv"
    chemin.write_text(TRENDS_HEBDO, encoding="utf-8")

    lignes = lire_google_trends(chemin, "FR", "2026-11-15")
    par_mois = {l["mois"]: l["valeur"] for l in lignes}

    assert par_mois == {"2021-05": 20.0, "2021-06": 10.0}
    assert {l["tendance"] for l in lignes} == {"lait-avoine"}
    assert {l["zone"] for l in lignes} == {"FR"}


def test_plus_recents_garde_la_derniere_extraction(tmp_path):
    for nom in ["dalgona_2026-11-01.csv", "dalgona_2026-11-15.csv"]:
        (tmp_path / nom).write_text("", encoding="utf-8")

    choisis = plus_recents(tmp_path)

    assert choisis["dalgona"][1] == "2026-11-15"


def test_controler_signale_les_mois_manquants_et_les_bornes():
    ligne = {
        "tendance": "dalgona",
        "terme": "dalgona coffee",
        "source": "google_trends",
        "zone": "MONDE",
        "mesure": "interet_recherche",
        "mois": "2020-04",
        "valeur": 120,
    }

    anomalies = controler([ligne])

    assert any("hors bornes" in a for a in anomalies)
    assert any("mois manquants" in a for a in anomalies)


def test_url_gdelt_couvre_la_fenetre():
    url = url_gdelt('"oat milk"')

    assert "mode=timelinevolraw" in url
    assert "startdatetime=20170101000000" in url
    assert "enddatetime=20251231235959" in url
