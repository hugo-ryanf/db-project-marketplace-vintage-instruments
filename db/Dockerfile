FROM postgres:16

# Copia os scripts de inicialização do banco.
# O PostgreSQL executa automaticamente os arquivos de /docker-entrypoint-initdb.d/
# na ordem alfabética, apenas na primeira vez que o volume é criado.
COPY sql/create_tables.sql /docker-entrypoint-initdb.d/01_create_tables.sql
COPY sql/seed.sql          /docker-entrypoint-initdb.d/02_seed.sql
COPY sql/03_indexes.sql    /docker-entrypoint-initdb.d/03_indexes.sql
COPY sql/04_views.sql      /docker-entrypoint-initdb.d/04_views.sql
COPY sql/05_procedures.sql /docker-entrypoint-initdb.d/05_procedures.sql
