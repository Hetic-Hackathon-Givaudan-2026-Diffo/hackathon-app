from pathlib import Path

import yaml
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)
CONTRAT = yaml.safe_load(
    (Path(__file__).parent.parent / "openapi.yaml").read_text(encoding="utf-8")
)


def test_health():
    reponse = client.get("/health")
    assert reponse.status_code == 200
    assert reponse.json() == {"status": "ok"}


def test_questions_renvoie_une_reponse_fixe():
    reponse = client.post("/questions", json={"question": "Bonjour ?"})
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["question"] == "Bonjour ?"
    assert corps["verdict"] in ("durable", "buzz")
    assert len(corps["raisons"]) >= 1
    assert corps["source"] == "fixe"


def test_questions_refuse_une_question_vide():
    assert client.post("/questions", json={"question": ""}).status_code == 422
    assert client.post("/questions", json={}).status_code == 422


def test_routes_conformes_au_contrat():
    # « Aucune route hors contrat » (AGENTS.md)
    routes_code = {
        (chemin, methode)
        for chemin, operations in app.openapi()["paths"].items()
        for methode in operations
    }
    routes_contrat = {
        (chemin, methode)
        for chemin, operations in CONTRAT["paths"].items()
        for methode in operations
    }
    assert routes_code == routes_contrat


def test_reponse_conforme_au_contrat():
    attendu = CONTRAT["components"]["schemas"]["Reponse"]
    corps = client.post("/questions", json={"question": "Bonjour ?"}).json()
    assert set(corps) == set(attendu["properties"])
    assert set(attendu["required"]) <= set(corps)
    assert corps["verdict"] in attendu["properties"]["verdict"]["enum"]
