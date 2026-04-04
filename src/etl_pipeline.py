import pandas as pd
from pandas import DataFrame
import re
import os
from sklearn.model_selection import train_test_split

# function to load raw data
def load_raw_data() -> DataFrame | None:
    # set the file path
    file_path = "sentiment-analyzer/data/raw/all_combined.csv"

    try:
        print(f"Attempting to extract data from {file_path}...")
        # read the csv
        df = pd.read_csv(file_path)

        print("Extraction Successful!")
        print(f"Total rows loaded: {len(df)}")

        print("\nFirst 5 rows of the dataset: ")
        print(df.head())

        return df
    
    except FileNotFoundError:
        print("Error: Could not find the CSV file. Check your file path.")
        return None
    
# main function for the data transformation
def transform_data(df: DataFrame) -> DataFrame:
    print("Starting to transform the data...")
    # drop those rows that the content and score is empty
    df = df.dropna(subset=['content', 'score'])
    # apply labels to scores
    df['sentiment'] = df['score'].apply(convert_to_sentiment)
    # now lets clean the contents
    df['cleaned_content'] = df['content'].apply(sanitize_content)
    # trim and get the features we actually use later on
    df_clean = df[['cleaned_content', 'sentiment']]

    print("Transformation Complete!")
    print(df_clean.head())

    return df_clean

# helper function to convert scores to sentiment
def convert_to_sentiment(score: int) -> str:
    if score >= 4:
        return 'Positive'
    elif score == 3:
        return 'Neutral'
    else:
        return 'Negative'

# helper function to sanitize the content
def sanitize_content(text) -> str:
    # safety check if the text is not a string and return empty
    if not isinstance(text, str):
        return ""
    # convert the text to lowercase
    text = text.lower()
    # replace those string that is not alphanumeric into a space
    text = re.sub(r'[^a-z0-9\s]', '', text)
    # remove extra double spaces
    text = re.sub(r'\s+', ' ', text).strip()

    return text

# function to split the data into training and test set
def load_processed_data(df_clean: DataFrame):
    print("Starting the Load Phase...")
    # split the data
    train_df, test_df = train_test_split(df_clean, test_size=0.2, random_state=42)
    processed_dir = "sentiment-analyzer/data/processed"

    # safety check create the folder if it doesnt exist
    if not os.path.exists(processed_dir):
        os.makedirs(processed_dir)
    
    # now lets make the path
    train_file = os.path.join(processed_dir, "train_data.csv")
    test_file = os.path.join(processed_dir, "test_data.csv")

    train_df.to_csv(train_file, index=False)
    test_df.to_csv(test_file, index=False)

    print("Load Complete!")
    print(f"Saved {len(train_df)} rows to {train_file}")
    print(f"Saved {len(test_df)} rows to {test_file}")

if __name__ == "__main__":
    # 1. Extract
    raw_data = load_raw_data()

    if raw_data is not None:
        # 2. Transform
        clean_data = transform_data(raw_data)

        # 3. Load
        load_processed_data(clean_data)

        print("\nSUCCESS: ETL Pipeline Finished. The data is now ready.")