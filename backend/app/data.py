import pandas as pd
import sqlite3
import os


def fetch_data_from_db(db_path: str = '../db.sqlite', query: str = 'SELECT * FROM mytable;'):
    # Get the absolute path to the database file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    absolute_db_path = os.path.join(current_dir, db_path)

    with sqlite3.connect(absolute_db_path) as conn:
        df = pd.read_sql(query, conn)
    return df


if __name__ == "__main__":
    df = fetch_data_from_db()
    print(df.head())
