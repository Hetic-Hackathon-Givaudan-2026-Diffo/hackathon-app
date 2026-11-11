# Service Data (`ia/`)

Service Python de l'équipe Data, exposé par une API FastAPI. L'API (`api/`) l'appelle en HTTP (ADR 0004). En cours de construction.

## Lancer

```bash
cd ia
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Swagger : http://localhost:8000/docs

## Règles

- Les routes et les formats sont fixés avec la Tech avant le code.
- Les secrets vont dans `ia/.env`, jamais commité.
- Données simulées uniquement.
