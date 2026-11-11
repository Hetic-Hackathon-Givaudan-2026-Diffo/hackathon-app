"""Service IA : première version avec une réponse fixe.

Le contrat (routes et formats) est décrit dans ia/openapi.yaml.
Le vrai calcul remplacera `repondre()` sans changer les formats.
"""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Service IA", version="0.1.0")


class Question(BaseModel):
    question: str = Field(min_length=1, examples=["Que recommandes-tu ?"])


class Reponse(BaseModel):
    question: str
    answer: str
    verdict: Literal["durable", "buzz"]
    raisons: list[str] = Field(min_length=1)
    recommendation: str
    source: str = Field(description="« fixe » tant que le vrai calcul n'existe pas")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/questions")
def repondre(entree: Question) -> Reponse:
    # Réponse fixe : permet à la Tech de tester l'intégration dès maintenant
    return Reponse(
        question=entree.question,
        answer="Ceci est une réponse fixe du service IA.",
        verdict="durable",
        raisons=["Réponse fixe : aucun calcul pour l'instant."],
        recommendation="Aucune recommandation pour l'instant.",
        source="fixe",
    )
