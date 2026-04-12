import pandas as pd
import joblib
from sklearn.metrics import classification_report, confusion_matrix

def evaluate_model():
    print("Loading the testing data and the trained AI...")

    # read the test data
    test_df = pd.read_csv("sentiment-analyzer/data/processed/test_data.csv")

    # safety check for nulls
    test_df['cleaned_content'] = test_df['cleaned_content'].fillna("")
    # the answer key
    y_test = test_df['sentiment']

    # load the vectorizer
    vectorizer = joblib.load("sentiment-analyzer/data/processed/tfidf_vectorizer.pkl")
    x_test = vectorizer.transform(test_df['cleaned_content'])

    # load the trained algorithm
    model = joblib.load("sentiment-analyzer/data/processed/sentiment_model.pkl")

    # the prediction
    print("AI is taking the final exam...")
    y_pred = model.predict(x_test)

    print("\n" + "="*40)
    print(" FINAL EXAM RESULTS: CLASSIFICATION REPORT ")
    print("="*40)

    print(classification_report(y_test, y_pred))

    print("\n" + "="*40)
    print(" THE 3x3 CONFUSION MATRIX ")
    print("="*40)

    # lets build the confusion matrix
    labels = ['Positive', 'Neutral', 'Negative']
    cm = confusion_matrix(y_test, y_pred, labels=labels)

    cm_df = pd.DataFrame(cm,
                        index=[f'Actual {l}' for l in labels],
                        columns=[f'Pred {l}' for l in labels])

    print(cm_df)

if __name__ == "__main__":
    evaluate_model()
