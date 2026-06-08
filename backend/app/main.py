from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.predictor import (
    model,
    predict_teams
)

app = FastAPI(
    title="World Cup Predictor API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://world-cup-predictor-rouge.vercel.app",
        "https://world-cup-predictor-git-main-fabiana-lmc-s-projects.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchRequest(BaseModel):
    home_team: str
    away_team: str

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
def predict_match_endpoint(request: MatchRequest):
    return predict_teams(
        request.home_team,
        request.away_team
    )
