from fastapi import FastAPI
from pydantic import BaseModel

from app.predictor import (
    model,
    predict_teams
)

app = FastAPI(
    title="World Cup Predictor API"
)

# ==============================
# Request Schema
# ==============================

class MatchRequest(BaseModel):

    home_team: str
    away_team: str

# ==============================
# Endpoints
# ==============================

@app.get("/")
def root():

    return {
        "message": "World Cup Predictor API Running"
    }


@app.get("/model")
def test_model():

    return {
        "model_loaded": str(type(model))
    }


@app.post("/predict")
def predict_match_endpoint(
    request: MatchRequest
):

    return predict_teams(
        request.home_team,
        request.away_team
    )