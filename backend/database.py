import psycopg2 

def connection():
    return psycopg2.connect(
        host="localhost",
        port= 5432,
        database="vintage_instruments",
        user="admin",
        password="postgres123"
    )

if __name__ == "__main__":
    conn = connection()
    print("Conexão bem-sucedida!")
    conn.close()

