import sqlite3
import os


def check_db():
    # Get the absolute path to the database file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'db.sqlite')

    print(f"Checking database at: {db_path}")

    if not os.path.exists(db_path):
        print(f"Database file does not exist at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()

        print(f"Tables in database: {tables}")

        # For each table, show its schema
        for table in tables:
            table_name = table[0]
            print(f"\nSchema for table '{table_name}':")
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  {col}")

        conn.close()
    except Exception as e:
        print(f"Error checking database: {str(e)}")


if __name__ == "__main__":
    check_db()
