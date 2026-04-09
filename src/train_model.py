from sklearn.naive_bayes import MultinomialNB
import joblib
from vectorize import vectorize

def train_model(x_train, y_train):
    print("Initializing Multinomial Naive Bayes Algorithm...")

    model = MultinomialNB()

    print("Training the model on 160,000 rows. This might take a few minutes...")
    model.fit(x_train, y_train)

    joblib.dump(model, "sentiment-analyzer/data/processed/sentiment_model.pkl")
    print("Model Successfully Trained and Saved!")
    
    return model

if __name__ == "__main__":
    x_train, x_test, y_train, y_test = vectorize()
    train_model(x_train, y_train)