-- Marketplace Vintage Instruments - Script de criação de tabelas

-- Drop tables na ordem inversa (dependentes primeiro)
DROP TABLE IF EXISTS itens_compra;
DROP TABLE IF EXISTS pagamentos;
DROP TABLE IF EXISTS compras;
DROP TABLE IF EXISTS formas_pagamento;
DROP TABLE IF EXISTS vendedores;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS instrumentos;

-- Tabelas independentes (sem chaves estrangeiras)

CREATE TABLE instrumentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    descricao TEXT DEFAULT 'Sem Descrição',
    preco NUMERIC(10, 2) NOT NULL,
    ano_fabricacao INTEGER NOT NULL,
    categoria VARCHAR(40) NOT NULL,
    marca VARCHAR(40) NOT NULL,
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

CREATE TABLE vendedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_admissao DATE
);

CREATE TABLE formas_pagamento (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(30) NOT NULL UNIQUE
);

-- Tabelas com chaves estrangeiras

CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id),
    id_vendedor INTEGER NOT NULL REFERENCES vendedores(id),
    data_compra DATE NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    status_compra VARCHAR(20) NOT NULL DEFAULT 'pendente',
    desconto_aplicado NUMERIC(10, 2) DEFAULT 0
);

CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    id_compra INTEGER NOT NULL UNIQUE REFERENCES compras(id),
    data_pagamento DATE,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'pendente',
    id_forma_pagamento INTEGER NOT NULL REFERENCES formas_pagamento(id)
);

CREATE TABLE itens_compra (
    id SERIAL PRIMARY KEY,
    id_compra INTEGER NOT NULL REFERENCES compras(id),
    id_instrumento INTEGER NOT NULL REFERENCES instrumentos(id),
    qtd_item INTEGER NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL
);
