# Échantillon de données

Échantillon commun pour calculer et tester le score (ticket #14). Il sert d'entrée à #16 (sous-scores durée et ampleur), #33 (barème appliqué à 3 cas, dont dalgona) et #15 (étiquetage des cas).

- Fichier : [`echantillon.csv`](echantillon.csv), une ligne par tendance, source, zone, mois et mesure.
- Fichiers bruts, gardés tels que reçus : [`brut/`](brut/).
- Script : [`ia/pipeline/echantillon.py`](../../ia/pipeline/echantillon.py), bibliothèque standard Python uniquement.

## Ce que contient l'échantillon

Trois tendances contrastées, prises parmi les candidats au rejeu de la note « Méthode du score buzz ou durable » : leur pic tombe entre 2017 et 2024, ce qui laisse 24 mois de recul pour l'étiquetage.

| Identifiant   | Tendance        | Requête GDELT      | Terme Google Trends | Verdict pressenti |
| ------------- | --------------- | ------------------ | ------------------- | ----------------- |
| `dalgona`     | Café dalgona    | `"dalgona coffee"` | `dalgona coffee`    | Éphémère          |
| `lait-avoine` | Lait d'avoine   | `"oat milk"`       | `oat milk`          | Durable           |
| `pates-feta`  | Pâtes à la feta | `"feta pasta"`     | `feta pasta`        | Éphémère          |

Le verdict pressenti vient de la recherche documentaire. Ce n'est pas une étiquette : l'étiquetage se fait à l'aveugle dans #15.

- Période : de 2017-01 à 2025-12, au mois (108 mois). La presse GDELT commence en 2017, et le mois est la granularité de la table `releves`.
- Canaux : la presse en ligne (GDELT), extraite le 2026-11-15, et l'intérêt de recherche dans tous les pays (Google Trends), exporté à la main le 2026-11-16.

## Colonnes de `echantillon.csv`

| Colonne           | Type   | Unité                                                              | Source                        | Exemple                                       |
| ----------------- | ------ | ------------------------------------------------------------------ | ----------------------------- | --------------------------------------------- |
| `tendance`        | texte  | identifiant, ou `ancrage` pour le terme d'ancrage Google Trends    | script (`TENDANCES`)          | `dalgona`                                     |
| `terme`           | texte  | terme ou expression exacte interrogée                              | requête envoyée à la source   | `dalgona coffee`                              |
| `source`          | texte  | `gdelt` ou `google_trends`                                         | script                        | `gdelt`                                       |
| `zone`            | texte  | `MONDE` ou code pays (`FR`)                                        | requête envoyée à la source   | `MONDE`                                       |
| `mois`            | date   | mois civil, `AAAA-MM`                                              | source, agrégée par le script | `2020-04`                                     |
| `mesure`          | texte  | nom de la mesure, voir le tableau suivant                          | script                        | `part_articles`                               |
| `valeur`          | nombre | celle de la colonne `unite`                                        | source, agrégée par le script | `81.1739`                                     |
| `unite`           | texte  | unité de `valeur`, en clair                                        | script                        | `articles par million d'articles suivis`      |
| `fichier_brut`    | texte  | chemin du fichier brut, depuis la racine du dépôt                  | script                        | `docs/data/brut/gdelt/dalgona_2026-11-15.csv` |
| `date_extraction` | date   | jour de l'extraction, `AAAA-MM-JJ`, lu dans le nom du fichier brut | script                        | `2026-11-15`                                  |

| Mesure              | Unité                                  | Calcul                                                                                        | Source                                                      |
| ------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `articles`          | nombre d'articles                      | somme sur le mois des articles qui contiennent l'expression                                   | GDELT, série `Article Count`                                |
| `part_articles`     | articles par million d'articles suivis | `articles` divisé par le total des articles suivis par GDELT le même mois, fois un million    | GDELT, séries `Article Count` et `Total Monitored Articles` |
| `interet_recherche` | indice de 0 à 100, relatif à l'export  | valeur exportée, « <1 » devient 0 ; moyenne des semaines du mois si l'export est hebdomadaire | Google Trends, export manuel                                |

Pour comparer des tendances dans le temps, utiliser `part_articles` et non `articles` : le nombre d'articles suivis par GDELT varie d'une année à l'autre, et sans le rapport au total cette variation passerait pour une hausse de la tendance.

## Citer les sources

Toute réutilisation de cet échantillon (rapport, présentation, écran de démonstration) cite ses deux sources.

- **GDELT**, dont les conditions d'utilisation demandent une citation et un lien vers son site : « Données de presse : The GDELT Project, API DOC 2.0, https://www.gdeltproject.org/, extraites le 2026-11-15. »
- **Google Trends** : « Données de recherche : Google Trends, https://trends.google.com/, exportées le 2026-11-16. »

## Sources

### Presse en ligne : GDELT

- Accès : API DOC 2.0, gratuite, sans clé ni compte. Requête `mode=timelinevolraw&format=csv`, du 2017-01-01 au 2025-12-31. L'URL exacte est construite par `url_gdelt()` dans le script.
- Format reçu : CSV quotidien, deux séries par jour (`Article Count` et `Total Monitored Articles`).
- Conditions : GDELT demande au plus une requête toutes les 5 secondes. En pratique, il renvoie 429 bien au-delà : le script attend 20 secondes entre deux tendances et réessaie en doublant l'attente. Si le 429 persiste, relancer plus tard pour une seule tendance : `python -m pipeline.echantillon telecharger-gdelt pates-feta`.
- Licence : jeux de données ouverts, utilisation libre et gratuite, à condition de citer The GDELT Project avec un lien vers https://www.gdeltproject.org/ ([conditions](https://www.gdeltproject.org/about.html#termsofuse)). La citation à reprendre est dans « Citer les sources ».
- Biais connus : l'expression anglaise favorise la presse anglophone ; GDELT ne suit que la presse en ligne qu'il indexe ; un article qui cite le terme n'en parle pas forcément. En juin 2025, GDELT ne fournit que 14 jours : `articles` est sous-estimé ce mois-là, `part_articles` reste comparable puisque le total couvre les mêmes jours.

### Intérêt de recherche : Google Trends

Pas de collecte automatique (hors périmètre de #40) : l'export se fait à la main, puis le script le lit.

1. Ouvrir Google Trends, page Explorer, période personnalisée du 2017-01-01 au 2025-12-31. Sur plus de 5 ans, Google Trends renvoie des valeurs mensuelles.
2. Saisir dans **la même requête** les 3 termes du tableau et un terme d'ancrage stable, par exemple `cheesecake`. Les valeurs ne sont comparables qu'à l'intérieur d'une même requête.
3. Choisir la zone « Dans tous les pays ». Pas d'export France : on y cherche « lait d'avoine », pas « oat milk », et le script ne connaît que les termes anglais.
4. Télécharger le graphique « Évolution de l'intérêt pour la recherche » (`multiTimeline.csv`) et le renommer `monde_AAAA-MM-JJ.csv`, avec la date du jour de l'export.
5. Le déposer dans `docs/data/brut/google_trends/`, puis lancer `python -m pipeline.echantillon construire`.

Lien de la requête utilisée : https://trends.google.com/trends/explore?date=2017-01-01%202025-12-31&q=dalgona%20coffee,oat%20milk,feta%20pasta,cheesecake&hl=fr

Export du 2026-11-16 (`monde_2026-11-16.csv`) : l'ancrage `cheesecake` reste entre 46 et 100, et les 3 termes restent lisibles hors de leurs périodes creuses. La résolution est faible : `oat milk` ne va que de 1 à 9 et `feta pasta` de 1 à 15, en valeurs entières. L'ancrage n'est pas parfaitement stable : il monte chaque fin d'année (fêtes) et culmine en avril et mai 2020 (pâtisserie du confinement). Un ancrage moins recherché et moins saisonnier améliorerait la précision ; à revoir si #16 en a besoin.

Points d'attention pour #16 :

- **Fuite temporelle** : Google Trends met 100 au pic de toute la fenêtre exportée. La valeur d'un mois dépend donc des mois qui suivent. Pour un calcul à une date d'analyse D, rapporter chaque terme au terme d'ancrage, ou refaire un export dont la fenêtre s'arrête à D.
- **Échantillonnage** : deux exports faits à des jours différents donnent des valeurs un peu différentes. C'est pourquoi la date d'extraction est gardée.
- Biais connus : des recherches ne sont pas des achats ; les termes peu recherchés sont bruités.

## Reproduire l'échantillon

Depuis `ia/` :

```sh
python -m pipeline.echantillon telecharger-gdelt
python -m pipeline.echantillon construire
python -m pytest tests/test_echantillon.py
```

`construire` prend, pour chaque fichier brut, l'extraction la plus récente (date dans le nom du fichier). Il s'arrête avec le code 1 et liste les anomalies s'il manque un mois ou si une valeur sort de ses bornes.

## Contrôles faits le 2026-11-16

- 1 080 lignes : 648 pour GDELT (3 tendances, 108 mois, 2 mesures) et 432 pour Google Trends (3 termes et l'ancrage, 108 mois). Aucun mois manquant, aucune valeur hors bornes.
- 7 tests passent (`tests/test_echantillon.py`), sans appel réseau.
- Aucune colonne n'identifie une personne : on ne garde que des comptes agrégés par mois, sans titre, auteur ni adresse d'article.
- Les 3 fichiers bruts ont été obtenus avec l'URL produite par `url_gdelt()`. Celui de `pates-feta` a été récupéré avec `curl` sur cette même URL, après des 429 répétés du script.

Premiers constats, calculés sur `part_articles`, à titre de vérification seulement (l'étiquetage reste celui de #15) :

| Tendance      | Articles en 9 ans | Mois du pic | Niveau à 12 mois du pic | Niveau à 24 mois du pic |
| ------------- | ----------------- | ----------- | ----------------------- | ----------------------- |
| `dalgona`     | 3 156             | 2020-04     | 7 %                     | 3 %                     |
| `lait-avoine` | 37 120            | 2021-05     | 67 %                    | 44 %                    |
| `pates-feta`  | 2 217             | 2021-04     | 10 %                    | 16 %                    |

- Les deux éphémères pressentis s'effondrent en moins d'un an. Les pâtes à la feta font un plateau de février à avril 2021, et non un pic d'un seul mois.
- Google Trends confirme la presse : `dalgona coffee` culmine à 50 en avril 2020 et passe sous 1 fin 2021 ; `feta pasta` culmine à 15 en février 2021, deux mois avant le pic de presse, puis reste à 1 ou 2 ; `oat milk` monte régulièrement, de 1 en 2017 à 7 à 9 en 2025.
- Le lait d'avoine reste haut : sa moyenne annuelle est de 58 par million en 2021 et de 60 en 2024. Pourtant, mesuré sur le mois du pic brut, il tombe à 44 % à 24 mois, sous le seuil de 50 % proposé pour « durable ». La définition de #15 doit donc porter sur un niveau lissé (moyenne mobile, par exemple), pas sur un mois isolé.

## Limites et points ouverts

- **Données réelles** : AGENTS.md demande des données simulées. Cet échantillon contient des agrégats publics réels, rangés dans `docs/data/` et utilisés seulement pour calibrer le score : ils ne sont jamais affichés dans l'application. À valider par l'équipe.
- **Dépôt public** (ADR 0002) : l'export Google Trends brut est republié dans le dépôt, avec sa source citée. Les conditions de Google sur la republication restent à vérifier dans #52.
- **Zone** : un seul export, tous pays confondus. Pas de série par pays.
- **Hors périmètre** : nettoyage poussé, désaisonnalisation, autres canaux (Open Food Facts, réseaux sociaux).
