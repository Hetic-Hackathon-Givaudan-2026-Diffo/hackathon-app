# Sources de données

Réponse au spike #13 : quelles sources du brief peut-on réellement utiliser, et peut-on récupérer des données réelles sur deux canaux de nature différente pendant le hackathon ?

## Réponse

**Oui.** Deux canaux de nature différente donnent un extrait daté, sans abonnement payant :

- la **presse en ligne**, par GDELT : 108 mois (2017-01 à 2025-12), 3 tendances, extrait le 2026-11-15 ;
- les **recherches en ligne**, par Google Trends : 108 mois, les mêmes 3 tendances et un terme d'ancrage, exporté à la main le 2026-11-16.

Le seuil du spike (au moins 12 mois pour au moins une tendance, sur chacun des deux canaux) est largement dépassé. Pas besoin de plan B pour ces deux canaux. Les extraits, leur format et leur construction sont décrits dans [`echantillon.md`](echantillon.md), livré par #14.

## Les canaux du brief

Statut : **faisable** (données obtenues ou accès libre vérifié), **incertain** (accès possible, mais utilité ou conditions à confirmer), **bloquant** (pas d'accès gratuit et légal pendant le hackathon).

| Canal                   | Source étudiée                                              | Type de signal                                               | Accès                                                                                                               | Format                                             | Profondeur                                    | Statut                                                                  |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Recherches en ligne     | Google Trends                                               | Intérêt de recherche, indice relatif de 0 à 100              | Gratuit, export manuel depuis le site, sans compte                                                                  | CSV mensuel au-delà de 5 ans, hebdomadaire en deçà | Depuis 2004                                   | Faisable, extrait obtenu                                                |
| Recherches en ligne     | Wikipédia (vues d'articles)                                 | Curiosité, nombre de vues par article et par langue          | API publique gratuite, sans clé                                                                                     | JSON quotidien ou mensuel                          | Depuis juillet 2015                           | Faisable, écarté par l'équipe                                           |
| Actualités              | GDELT, API DOC 2.0                                          | Couverture presse, nombre d'articles rapporté au total suivi | API publique gratuite, sans clé ni compte                                                                           | CSV quotidien                                      | Depuis 2017 pour l'API DOC                    | Faisable, extrait obtenu                                                |
| Actualités              | Flux RSS de la presse                                       | Titres et dates d'articles récents                           | Gratuit, site par site, selon robots.txt                                                                            | XML                                                | Quelques semaines : pas d'historique          | Incertain : utile pour la veille (#41), pas pour l'historique           |
| Données de consommation | Open Food Facts                                             | Produits ajoutés à la base, par marque et catégorie          | Gratuit, export complet, licence ODbL                                                                               | CSV, JSONL ou Parquet                              | Depuis 2012, date d'ajout et non de lancement | Incertain : à tester pour l'adoption en rayon                           |
| Données de consommation | Panels de vente (Circana, Nielsen) et données de Givaudan   | Ventes, réachat                                              | Payant ; aucun contact avec Givaudan pendant le hackathon                                                           | Non applicable                                     | Non applicable                                | Bloquant                                                                |
| Réseaux sociaux         | TikTok, Instagram, X, Reddit                                | Mentions, vues, engagement                                   | API payantes ou réservées à la recherche académique sur dossier ; le scraping enfreint les conditions d'utilisation | JSON                                               | Variable                                      | Bloquant                                                                |
| Influenceurs            | Plateformes d'analyse d'influenceurs                        | Audience et publications de comptes identifiés               | Payant                                                                                                              | Non applicable                                     | Non applicable                                | Bloquant                                                                |
| Brevets                 | Office européen des brevets (OPS), Google Patents, Lens.org | Dépôts de brevets par mot-clé ou classe                      | Gratuit, inscription pour l'OPS de l'Office européen des brevets                                                    | XML ou JSON                                        | Plusieurs décennies                           | Incertain : publication 18 mois après le dépôt, trop lente pour un buzz |

Les conditions des sources non testées (réseaux sociaux, influenceurs, brevets, panels) sont tirées de la recherche documentaire. Elles sont à revérifier avant tout usage.

## Les deux canaux testés

### Presse en ligne : GDELT

- **Conditions** : pas de clé ni de quota écrit, mais GDELT demande au plus une requête toutes les 5 secondes et renvoie souvent l'erreur 429 bien au-delà. Prévoir 20 secondes entre deux requêtes et des reprises.
- **Licence** : utilisation libre et gratuite, à condition de citer The GDELT Project avec un lien vers https://www.gdeltproject.org/.
- **Données personnelles** : aucune dans ce qu'on garde. La série `timelinevolraw` ne donne que des comptes d'articles par jour, sans titre, auteur ni adresse.
- **Biais** : l'expression anglaise favorise la presse anglophone ; GDELT ne suit que la presse en ligne qu'il indexe ; un article qui cite le terme n'en parle pas forcément ; juin 2025 ne compte que 14 jours de données.

### Recherches en ligne : Google Trends

- **Conditions** : pas de compte, mais pas d'API ouverte. L'export se fait à la main, et la collecte automatique est hors périmètre (#40). Les termes ne sont comparables qu'à l'intérieur d'une même requête, d'où le terme d'ancrage.
- **Licence** : réutilisation avec citation de la source « Google Trends ». La republication de l'export brut dans un dépôt public reste à vérifier dans #52.
- **Données personnelles** : aucune. Google ne publie qu'un indice agrégé et anonymisé.
- **Biais** : indice relatif, ramené à 100 au pic de la fenêtre exportée, ce qui crée une fuite temporelle à corriger dans #16 ; valeurs échantillonnées, qui changent un peu d'un export à l'autre ; résolution faible pour les termes peu recherchés ; des recherches ne sont pas des achats.

## Limites RGPD

- Les deux canaux retenus ne donnent que des agrégats : aucune donnée personnelle n'est collectée ni conservée.
- Les réseaux sociaux et les influenceurs porteraient sur des comptes identifiés : ce serait un traitement de données personnelles, avec une base légale à justifier et une analyse d'impact. C'est une raison de plus pour les laisser hors du hackathon, en plus de l'accès payant.
- Les collecteurs de la Sentinelle (#41) devront garder la même règle : un titre, une source nommée et une date, jamais d'auteur ni de compte.

## Plan B

Pas de plan B nécessaire pour les deux canaux testés. Si l'un d'eux devenait inaccessible :

- pour la presse, les vues Wikipédia couvrent la même période, avec un biais connu : l'article d'un buzz naît souvent pendant le buzz ;
- pour l'application, les données affichées restent simulées et marquées comme telles, comme le demande AGENTS.md.

## Ce que ça ouvre

- **#14** : l'échantillon de 3 tendances sur ces deux canaux.
- **#40** : l'import des CSV Google Trends peut reprendre le lecteur de `ia/pipeline/echantillon.py`, qui gère déjà « <1 » et les libellés de zone en français.
- **#41** : GDELT est confirmé pour la Sentinelle ; Wikipédia est à retirer de son périmètre, comme l'équipe l'a décidé.
- **Open Food Facts** : seul canal de consommation gratuit, à tester pour le critère d'adoption en rayon (V5).
