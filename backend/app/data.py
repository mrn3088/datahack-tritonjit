import pandas as pd
import sqlite3


def fetch_data_from_db(db_path: str = 'db.sqlite', query: str = 'SELECT * FROM mytable;'):
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql(query, conn)
    return df


if __name__ == "__main__":
    df = fetch_data_from_db()
    print(df.head())
