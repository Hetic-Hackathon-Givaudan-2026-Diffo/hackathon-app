# Services externes

Le prototype tourne en local avec `docker compose up` et n'est jamais publié en ligne. Toutes les données sont simulées. Cette liste couvre les services dont le projet dépend pour être développé et démontré.

| Service                        | Usage                                                                                     | Clé nécessaire                             | Quota                                           | Coût estimé pour la démonstration |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------- | --------------------------------- |
| Ollama (local)                 | Modèle de langage pour la recommandation et l'interface conversationnelle (service `ia/`) | Non                                        | Aucun : limité par la machine                   | 0 €                               |
| GitHub (dépôt public, Actions) | Code, tickets, CI `qualite`                                                               | Non pour lire ; compte membre pour pousser | Minutes d'Actions gratuites sur un dépôt public | 0 €                               |
| Docker Hub                     | Images `postgres:17`, `node:24-trixie` et image Python du service `ia/`                   | Non                                        | Téléchargements limités sans compte connecté    | 0 €                               |
| Registres npm et PyPI          | Dépendances JavaScript et Python                                                          | Non                                        | Aucun quota bloquant                            | 0 €                               |

## Service écarté pour l'instant

| Service                                                 | Pourquoi écarté                                                                                             | Clé nécessaire                        | Coût                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| API de modèle de langage payante (Mistral, par exemple) | Pas de budget, et les questions quitteraient la machine. Gardée comme plan B si le benchmark Ollama échoue. | Oui, dans `api/.env`, jamais commitée | Payant à l'usage : plafond de dépenses à fixer avant de partager une clé |

## Règles

- Une clé éventuelle va dans `api/.env`, jamais dans le code. `api/.env.example` ne contient que des noms de variables.
- Tout nouveau service externe s'ajoute à ce fichier, dans la pull request qui l'introduit.
