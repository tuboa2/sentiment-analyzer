import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib # this will save the vectorizer as a file

def vectorize():
    print("Starting Text Vectorization...")

    # load the data
    train_df = pd.read_csv("sentiment-analyzer/data/processed/train_data.csv")
    test_df = pd.read_csv("sentiment-analyzer/data/processed/test_data.csv")

    # ensure no nulls sneaked in
    train_df['cleaned_content'] = train_df['cleaned_content'].fillna("")
    test_df['cleaned_content'] = test_df['cleaned_content'].fillna("")

    # initialize the vectorizer
    vectorizer = TfidfVectorizer(max_features=5000)

    # split into input/output
    print("Fitting TF-IDF to training data...")
    x_train = vectorizer.fit_transform(train_df['cleaned_content'])
    x_test = vectorizer.transform(test_df['cleaned_content'])

    # extract the target labels
    y_train = train_df['sentiment']
    y_test = test_df['sentiment']
    
    # save the vectorizer model
    joblib.dump(vectorizer, "sentiment-analyzer/data/processed/tfidf_vectorizer.pkl")
    print(f"Vectorizer saved to data/processed as tfidf_vectorizer.pkl")

    print(f"Training Sparse Matrix Shape: {x_train.shape}")

    return x_train, x_test, y_train, y_test

if __name__ == "__main__":
    x_train, x_test, y_train, y_test = vectorize()
    print("\nSUCCESS: Data is vectorized and ready for the algorithm.")