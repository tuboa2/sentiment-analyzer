from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

# initialize app
app = FastAPI(title="Sentiment Analyzer")

# add origins
origins = [
    "http://localhost:5173",          # Your local Vite React server
    "http://127.0.0.1:5173",          # Alternate local URL
    "https://sentiment-analyzer-drab.vercel.app/" # REPACE THIS with your actual Vercel URL
]

# cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # allows communication to backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class SentimentRequest(BaseModel):
    text: str

# load the the model globally
print("Loading the AI Model...")

# this will get the absolute path since the relative wont work
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
vectorizer_dir = os.path.join(root_dir, "data", "processed", "tfidf_vectorizer.pkl")
model_dir = os.path.join(root_dir, "data", "processed", "sentiment_model.pkl")

try:
    vectorizer = joblib.load(vectorizer_dir)
    model = joblib.load(model_dir)
    print("SUCCESS: AI Model Successfully Loaded!")
except Exception as e:
    print(f"ERROR: Could not load the AI Model. {e}")
    raise e

# post endpoint
@app.post("/analyze-sentiment")
async def analyze_sentiment(request: SentimentRequest):
    # no text must be empty
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="ERROR: Text cannot be empty.")

    try:
        # vectorize the text
        vectorized_text = vectorizer.transform([request.text])
        # get the prediction
        prediction = model.predict(vectorized_text)[0]
        # get the probabilities
        probabilities = model.predict_proba(vectorized_text)[0]
        classes = model.classes_ # which probabilities belongs to a class
        # transform into hash map
        prob_dict = {classes[i]: round(float(probabilities[i]), 4) for i in range(len(classes))}
        # return the final json
        return {
            "original_text": request.text,
            "predicted_sentiment": prediction,
            "raw_probabilities": prob_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing Error: {str(e)}")
