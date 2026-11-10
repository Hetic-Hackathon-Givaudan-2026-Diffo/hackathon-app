# AGENTS.md

API Express et front Vite en TypeScript, PostgreSQL 17, service Data en Python dans `ia/`, le tout dans un dev container. Données simulées uniquement.

## Lancer (dans le dev container)

- `npm run dev` : API sur le port 3000, front sur le port 5173.
- `curl -s localhost:3000/api/health` répond `"status":"ok"`.
- Avant de finir : `npm run lint && npm run format:check && npm run build`, comme la CI `qualite`.

## Règles

- `openapi.yaml` d'abord, le code ensuite. Aucune route hors contrat.
- Routes de l'API : `api/src/`. Proxy `/api` : `web/vite.config.ts`.
- `db/init/` n'est joué qu'au premier démarrage : supprimer `db/data/` pour le rejouer.
- Appel à `ia/` : 10 secondes au plus, sinon l'écran affiche un message de secours.
- Toute erreur de l'API suit le schéma `Erreur` de `openapi.yaml`.
- Une branche `feature/` par ticket, pull request vers `develop` avec `Closes #N`.

## Qualité

- Chaque écran affiche « Données simulées ».
- Un signal est classé durable ou buzz, affiché en texte, avec au moins une raison.
- Tout texte produit par l'IA porte la mention « Rédigé par une IA ».
- Interface : ni emoji, ni tiret cadratin.

## Décisions

Lis `docs/adr/` avant d'ajouter une dépendance. Pour changer une décision acceptée, propose un nouvel ADR et arrête-toi.

## Interdit

- `git commit --no-verify` et `eslint-disable`.
- `npm install` hors du conteneur.
- Une clé dans le code : les secrets vont dans `api/.env`.
