FROM postgres:16

# Copia os scripts de inicialização do banco.
# O PostgreSQL executa automaticamente os arquivos de /docker-entrypoint-initdb.d/
# na ordem alfabética, apenas na primeira vez que o volume é criado.
COPY sql/create_tables.sql /docker-entrypoint-initdb.d/01_create_tables.sql
COPY sql/seed.sql /docker-entrypoint-initdb.d/02_seed.sql
