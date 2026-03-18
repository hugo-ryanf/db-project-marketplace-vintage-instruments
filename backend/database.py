import psycopg2
import os

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=5432,
        database="vintage_instruments",
        user="admin",
        password="postgres123"
    )

if __name__ == "__main__":
    conn = get_connection()
    print("Conexão bem-sucedida!")
    conn.close()

