# Service Data (`ia/`)

Service Python de l'équipe Data, exposé par une API FastAPI. L'API (`api/`) l'appelle en HTTP (ADR 0004). En cours de construction.

> **Version actuelle : réponse fixe.** Le service renvoie toujours la même réponse, pour que la Tech puisse tester l'intégration. Le vrai calcul viendra ensuite, sans changer les formats.

## Les routes

Le contrat est dans [`openapi.yaml`](openapi.yaml) ; un test vérifie que le code le respecte.

| Route        | Méthode | Rôle                                                     |
| ------------ | ------- | -------------------------------------------------------- |
| `/health`    | GET     | renvoie `{"status": "ok"}` si le service est en vie      |
| `/questions` | POST    | reçoit `{"question": "..."}` et renvoie une réponse fixe |

## Lancer

```bash
cd ia
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn main:app --reload
```

Sous Windows (PowerShell) : `py -m venv .venv`, puis `.venv\Scripts\activate`.

Swagger : http://localhost:8000/docs

Avec Docker, depuis la racine du dépôt : `docker compose up --build ia`. Depuis le conteneur `dev`, l'API joint le service sur http://ia:8000.

## Vérifier

```bash
curl http://localhost:8000/health
```

```bash
curl -X POST http://localhost:8000/questions -H 'Content-Type: application/json' -d '{"question": "Bonjour ?"}'
```

Réponse attendue :

```json
{
  "question": "Bonjour ?",
  "answer": "Ceci est une réponse fixe du service IA.",
  "verdict": "durable",
  "raisons": ["Réponse fixe : aucun calcul pour l'instant."],
  "recommendation": "Aucune recommandation pour l'instant.",
  "source": "fixe"
}
```

Tests, depuis `ia/` avec l'environnement activé : `pytest`.

## Règles

- Les routes et les formats sont fixés avec la Tech avant le code.
- Les secrets vont dans `ia/.env`, jamais commité.
- Données simulées uniquement.
