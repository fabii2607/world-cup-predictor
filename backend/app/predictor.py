from pathlib import Path
import joblib
import pandas as pd

# ==============================
# Model Loading
# ==============================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = BASE_DIR / "models"

model = joblib.load(
    MODEL_DIR / "world_cup_model.pkl"
)

encoder = joblib.load(
    MODEL_DIR / "label_encoder.pkl"
)

features = joblib.load(
    MODEL_DIR / "model_features.pkl"
)

# ==============================
# Prediction Function
# ==============================

def predict_match(feature_dict):

    X = pd.DataFrame([feature_dict])

    prediction = model.predict(X)[0]

    probabilities = model.predict_proba(X)[0]

    return {
        "prediction": encoder.inverse_transform(
            [prediction]
        )[0],

        "probabilities": {
            encoder.classes_[i]: float(probabilities[i])
            for i in range(len(probabilities))
        }
    }

    # ==============================
# Team Data
# ==============================

team_strength = pd.read_csv(
    BASE_DIR / "data" / "processed" / "team_strength.csv"
)


def build_match_features(
    home_team,
    away_team
):

    home = team_strength[
        team_strength["home_team"] == home_team
    ].iloc[0]

    away = team_strength[
        team_strength["home_team"] == away_team
    ].iloc[0]

    return {

        "home_avg_points_last_5":
            home["home_avg_points_last_5"],

        "away_avg_points_last_5":
            away["home_avg_points_last_5"],

        "home_avg_goals_scored_last_5":
            home["home_avg_goals_scored_last_5"],

        "away_avg_goals_scored_last_5":
            away["home_avg_goals_scored_last_5"],

        "home_avg_goals_conceded_last_5":
            home["home_avg_goals_conceded_last_5"],

        "away_avg_goals_conceded_last_5":
            away["home_avg_goals_conceded_last_5"],

        "home_avg_goal_diff_last_5":
            home["home_avg_goal_diff_last_5"],

        "away_avg_goal_diff_last_5":
            away["home_avg_goal_diff_last_5"],

        "home_win_streak":
            home["home_win_streak"],

        "away_win_streak":
            away["home_win_streak"],

        "home_clean_sheets_last_5":
            home["home_clean_sheets_last_5"],

        "away_clean_sheets_last_5":
            away["home_clean_sheets_last_5"],

        "home_momentum_score":
            home["home_momentum_score"],

        "away_momentum_score":
            away["home_momentum_score"],

        "home_elo":
            home["home_elo"],

        "away_elo":
            away["home_elo"],

        "elo_difference":
            home["home_elo"] -
            away["home_elo"]
    }

def predict_teams(
    home_team,
    away_team
):

    features_dict = build_match_features(
        home_team,
        away_team
    )

    return predict_match(
        features_dict
    )