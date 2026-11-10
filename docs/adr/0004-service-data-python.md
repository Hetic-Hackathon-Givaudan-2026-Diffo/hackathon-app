# 0004. Exposer le travail Data par un service Python dans ce dépôt

- Statut : acceptée
- Date : 2026-11-09
- Décideurs : Erica, Valentin, Jae-heun

## Contexte

Les deux Data codent en Python ; l'API et le front sont en TypeScript (ADR 0001). Le prototype n'utilise que des données fictives. Au jalon m2, `docker compose up` doit lancer toute la chaîne, de l'écran aux données, sans dépendre d'une machine en particulier.

## Options

1. Un service FastAPI dans `ia/`, lancé par `compose.yaml` : le contrat est écrit dans `openapi.yaml` et l'API l'appelle en HTTP. Un service et un langage de plus à maintenir.
2. Les scripts Data écrivent directement dans PostgreSQL, et l'API lit les tables : pas d'API à écrire. Le schéma devient le contrat, et un changement de colonne casse l'API sans prévenir.
3. Un service sur la machine d'un Data, exposé par un tunnel ngrok : rien à conteneuriser. L'URL est publique, et la démo tombe si la machine est en veille.

## Décision

Nous choisissons l'option 1 : un service FastAPI dans `ia/`, ajouté à `compose.yaml`, avec un contrat `openapi.yaml` écrit avant le code.

## Conséquences

- Positives : `docker compose up` lance tout ; les Data et la Tech avancent en parallèle, chacun d'un côté du contrat.
- Négatives, à accepter : tout changement de route ou de format passe par une pull request sur `openapi.yaml`, relue par les deux côtés.
- À revoir si : un modèle demande un GPU que Docker ne voit pas. Le service tournera alors sur la machine d'un Data, avec une réponse fixe de secours dans l'API.
