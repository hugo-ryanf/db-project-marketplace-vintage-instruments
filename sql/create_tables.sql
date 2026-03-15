CREATE TABLE instrumentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    descricao TEXT DEFAULT 'Sem Descrição',
    preco NUMERIC(10, 2) NOT NULL,
    ano_fabricacao INTEGER NOT NULL,
    categoria VARCHAR(40) NOT NULL,
    marca VARCHAR (40) NOT NULL,
    qtd_estoque INTEGER NOT NULL DEFAULT 0,
    fabricado_em_serido BOOLEAN NOT NULL DEFAULT false
);