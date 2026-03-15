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

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    cidade VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    torce_flamengo BOOLEAN NOT NULL DEFAULT false,
    assiste_op BOOLEAN NOT NULL DEFAULT false
);
