# Sentiment Analyzer: Full-Stack Sentiment Analysis

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg?logo=scikit-learn)](https://scikit-learn.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg?logo=vercel)](https://vercel.com/)

A lightweight, end-to-end machine learning application that analyzes human text and mathematically categorizes its sentiment (Positive, Neutral, or Negative) in milliseconds. 

**[View Live Demo](https://sentiment-analyzer-drab.vercel.app/)** | **[View API Docs](https://sentiment-analyzer-mlld.onrender.com/docs)**

---

## System Architecture
This project was specifically architected to be highly performant and memory-efficient. Instead of relying on massive, hardware-heavy Deep Learning models, it utilizes a deeply optimized classic Machine Learning pipeline capable of running locally on constrained hardware (Dual-Core AMD E2 9010, 8GB RAM) without sacrificing accuracy.

### Tech Stack
* **Frontend:** React (Vite), Tailwind CSS (v4)
* **Backend:** FastAPI, Uvicorn, Pydantic
* **Machine Learning:** Scikit-learn, Pandas, Joblib
* **Deployment:** Vercel (UI), Render (API)

---

## Core Features
* **Custom Machine Learning Model:** Trained on a rigorously balanced dataset of Google Play Store reviews using `MultinomialNB` with uniform priors.
* **Smart Text Vectorization:** Utilizes `TfidfVectorizer` (capped at 5,000 features) to mathematically weigh rare, informative words while ignoring unhelpful noise.
* **Raw Probability Engine:** Doesn't just guess the sentiment-returns the exact mathematical confidence percentages for all three categories.
* **Lightning-Fast Inference:** FastAPI backend processes matrix transformations and returns predictions in under 50ms.
* **Responsive UI:** Clean, modern React dashboard that visually maps the mathematical breakdown using dynamic progress bars.

---

## Data Engineering & Model Performance
The original dataset suffered from severe class imbalance (80% Positive). To prevent lazy statistical guessing, the data pipeline includes an automated **Undersampling Engine** that randomly chops the majority classes down to match the minority class. 

**Final Training Setup:**
* **Total Rows:** 6,051 perfectly balanced rows (2,051 Negative, 2,011 Neutral, 1,989 Positive).
* **Algorithm:** Multinomial Naive Bayes (`fit_prior=False`)
* **Evaluation Metrics:** * Accuracy: 60% (Nearly 2x better than random chance baseline of 33%)
  * Macro F1-Score: 0.58

---

## Local Setup & Installation

If you want to run this project locally, follow these steps. You will need two separate terminal windows.

### 1. Start the FastAPI Backend
```bash
# Clone the repository
git clone https://github.com/tuboa2/sentiment-analyzer.git
cd sentiment-analyzer/src

# Install the exact Python dependencies
pip install -r requirements.txt

# Boot up the server
uvicorn src.main:app --reload
```
*The API will be live at `http://127.0.0.1:8000`. You can view the automated Swagger UI at `/docs`.*

### 2. Start the React Frontend
Open a new terminal window:
```bash
cd semtiment-analyzer/ui

# Install Node dependencies
pmpm install

# Start the Vite development server
pnpm dev
```
*The UI will be live at `http://localhost:5173`.*

---

## API Reference

### Analyze Text Sentiment
`POST /analyze-sentiment`

**Request Body (JSON):**
```json
{
  "text": "The new update is absolutely terrible, it crashes my phone."
}
```

**Response (JSON):**
```json
{
  "original_text": "The new update is absolutely terrible, it crashes my phone.",
  "predicted_sentiment": "Negative",
  "raw_probabilities": {
    "Negative": 0.8251,
    "Neutral": 0.1210,
    "Positive": 0.0539
  }
}
```

---

## Future Road Map
* **Data Augmentation:** Implement synthetic data generation for the "Neutral" class to increase training volume without losing balance.
* **Model Upgrades:** Test `SGDClassifier` using `partial_fit` chunking for larger datasets.
* **Batch Processing Endpoint:** Allow users to upload a CSV file and return a fully categorized column.

---
*Built with discipline and caffeine by Kazuha & Tuboa.*
