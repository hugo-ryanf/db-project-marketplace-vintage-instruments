# Guia Técnico — Marketplace de Instrumentos Vintage

> Disciplina: Banco de Dados I · Projeto Parte 1 e Parte 2  
> Stack: PostgreSQL · Python/FastAPI · Next.js

---

## Sumário

1. [Visão geral da arquitetura](#1-visão-geral-da-arquitetura)
2. [Banco de Dados — Modelagem](#2-banco-de-dados--modelagem)
3. [Seed — Dados iniciais](#3-seed--dados-iniciais)
4. [Índices](#4-índices)
5. [View](#5-view)
6. [Stored Procedure](#6-stored-procedure)
7. [Backend — Conexão com o banco](#7-backend--conexão-com-o-banco)
8. [Backend — Schemas (Pydantic)](#8-backend--schemas-pydantic)
9. [Backend — CRUD (queries detalhadas)](#9-backend--crud-queries-detalhadas)
10. [Backend — API (rotas FastAPI)](#10-backend--api-rotas-fastapi)
11. [Fluxo completo de uma compra](#11-fluxo-completo-de-uma-compra)

---

## 1. Visão geral da arquitetura

```
┌──────────────────┐        HTTP/JSON         ┌──────────────────────┐
│  Frontend        │ ◄──────────────────────► │  Backend (FastAPI)   │
│  Next.js 14      │                           │  Python 3.11         │
│  (porta 3000)    │                           │  (porta 8000)        │
└──────────────────┘                           └──────────┬───────────┘
                                                          │ psycopg2
                                                          │ SQL puro
                                               ┌──────────▼───────────┐
                                               │  PostgreSQL 15        │
                                               │  (porta 5432)         │
                                               └──────────────────────┘
```

Toda a comunicação entre o frontend e o banco de dados passa pelo backend.
O frontend nunca acessa o banco diretamente — ele faz requisições HTTP para a API,
que executa SQL e devolve JSON.

**Arquivos SQL executados na ordem (via Docker init):**

```
sql/create_tables.sql   → cria as tabelas
sql/seed.sql            → insere dados iniciais
sql/03_indexes.sql      → cria os índices
sql/04_views.sql        → cria a view
sql/05_procedures.sql   → cria a stored procedure
```

---

## 2. Banco de Dados — Modelagem

Arquivo: [sql/create_tables.sql](sql/create_tables.sql)

### Diagrama de relacionamentos

```
instrumentos ◄──── itens_compra ────► compras ◄──── pagamentos
                                          │               │
                                      clientes     formas_pagamento
                                          │
                                      vendedores
```

### Tabela `instrumentos`

```sql
CREATE TABLE instrumentos (
    id               SERIAL PRIMARY KEY,
    nome             VARCHAR(60)    NOT NULL,
    descricao        TEXT           DEFAULT 'Sem Descrição',
    preco            NUMERIC(10,2)  NOT NULL,
    ano_fabricacao   INTEGER        NOT NULL,
    categoria        VARCHAR(40)    NOT NULL,
    marca            VARCHAR(40)    NOT NULL,
    qtd_estoque      INTEGER        NOT NULL DEFAULT 0,
    fabricado_em_serido BOOLEAN     NOT NULL DEFAULT false
);
```

**Decisões de modelagem:**
- `SERIAL PRIMARY KEY` → PostgreSQL gera um inteiro autoincremental como identificador único. Equivale a `INTEGER GENERATED ALWAYS AS IDENTITY`.
- `NUMERIC(10,2)` → tipo exato para valores monetários. Evita erros de arredondamento que ocorrem com `FLOAT` ou `DOUBLE PRECISION`.
- `fabricado_em_serido BOOLEAN` → flag booleana para filtro regional, usada como critério de busca no catálogo.

### Tabela `clientes`

```sql
CREATE TABLE clientes (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(60)  NOT NULL,
    email           VARCHAR(60)  NOT NULL UNIQUE,
    telefone        VARCHAR(20)  NOT NULL UNIQUE,
    cpf             VARCHAR(14)  NOT NULL UNIQUE,
    endereco        TEXT         NOT NULL,
    cidade          VARCHAR(30)  NOT NULL,
    estado          VARCHAR(30)  NOT NULL,
    torce_flamengo  BOOLEAN      NOT NULL DEFAULT false,
    assiste_op      BOOLEAN      NOT NULL DEFAULT false
);
```

**Restrições de integridade:**
- `UNIQUE` em `email`, `telefone` e `cpf` → garantem que não existam dois clientes com o mesmo dado de contato ou documento. O banco rejeita o INSERT automaticamente com um erro se houver duplicata.
- `torce_flamengo` e `assiste_op` → campos booleanos que determinam elegibilidade a descontos (regra de negócio da Parte 2).

### Tabela `vendedores`

```sql
CREATE TABLE vendedores (
    id             SERIAL PRIMARY KEY,
    nome           VARCHAR(60)  NOT NULL,
    email          VARCHAR(60)  NOT NULL UNIQUE,
    telefone       VARCHAR(20),
    cpf            VARCHAR(14)  NOT NULL UNIQUE,
    data_admissao  DATE
);
```

`telefone` e `data_admissao` são opcionais (sem `NOT NULL`), refletindo que nem sempre essas informações estão disponíveis no cadastro.

### Tabela `formas_pagamento`

```sql
CREATE TABLE formas_pagamento (
    id        SERIAL PRIMARY KEY,
    descricao VARCHAR(30) NOT NULL UNIQUE
);
```

Tabela de referência (lookup table). Armazena os tipos de pagamento válidos: `credito`, `debito`, `boleto`, `pix`. A restrição `UNIQUE` impede duplicatas na descrição.

### Tabela `compras`

```sql
CREATE TABLE compras (
    id               SERIAL PRIMARY KEY,
    id_cliente       INTEGER       NOT NULL REFERENCES clientes(id),
    id_vendedor      INTEGER       NOT NULL REFERENCES vendedores(id),
    data_compra      DATE          NOT NULL,
    valor_total      NUMERIC(10,2) NOT NULL,
    status_compra    VARCHAR(20)   NOT NULL DEFAULT 'pendente',
    desconto_aplicado NUMERIC(10,2) DEFAULT 0
);
```

**Chaves estrangeiras (integridade referencial):**
- `REFERENCES clientes(id)` → impede que uma compra seja criada com um `id_cliente` que não exista na tabela `clientes`.
- `REFERENCES vendedores(id)` → idem para vendedores.

Se alguém tentar deletar um cliente que tem compras, o banco bloqueia a operação — comportamento padrão `ON DELETE RESTRICT`.

`desconto_aplicado` armazena a taxa de desconto efetivamente usada (ex: `0.10` para 10%), o que permite auditoria posterior sem recalcular.

### Tabela `pagamentos`

```sql
CREATE TABLE pagamentos (
    id                   SERIAL PRIMARY KEY,
    id_compra            INTEGER       NOT NULL UNIQUE REFERENCES compras(id),
    data_pagamento       DATE,
    status_pagamento     VARCHAR(20)   NOT NULL DEFAULT 'pendente',
    id_forma_pagamento   INTEGER       NOT NULL REFERENCES formas_pagamento(id)
);
```

`UNIQUE` em `id_compra` impõe uma relação 1-para-1 entre compra e pagamento: cada compra tem exatamente um registro de pagamento. Isso é modelagem de **especialização**: a compra é o fato, e o pagamento é um atributo dela que pode ter seu próprio ciclo de vida (confirmado, pendente, recusado).

### Tabela `itens_compra`

```sql
CREATE TABLE itens_compra (
    id              SERIAL PRIMARY KEY,
    id_compra       INTEGER       NOT NULL REFERENCES compras(id),
    id_instrumento  INTEGER       NOT NULL REFERENCES instrumentos(id),
    qtd_item        INTEGER       NOT NULL,
    preco_unitario  NUMERIC(10,2) NOT NULL
);
```

`preco_unitario` é armazenado no momento da compra, não referenciado do cadastro do instrumento. Isso é fundamental: o preço do instrumento pode mudar no futuro, mas o preço pago pelo cliente naquela compra precisa ser imutável. Esse padrão é chamado de **desnormalização controlada** ou **snapshot de preço**.

---

## 3. Seed — Dados iniciais

Arquivo: [sql/seed.sql](sql/seed.sql)

O seed popula o banco com dados realistas para que o sistema já funcione sem que o usuário precise cadastrar tudo do zero. Ele é executado uma única vez na inicialização do container Docker.

**Formas de pagamento:**
```sql
INSERT INTO formas_pagamento (descricao)
VALUES ('credito'), ('debito'), ('boleto'), ('pix');
```

Um `INSERT` multi-valores é mais eficiente do que quatro INSERTs separados: o banco faz uma única transação.

**Instrumentos:**

Cada instrumento tem `fabricado_em_serido` definido. Nos dados de exemplo, três instrumentos têm esse campo como `true`:
- Acordeão Scandalli 1950
- Rabeca Artesanal Seridó 1980
- Zabumba Artesanal Seridó 1990

Isso permite testar o filtro regional no catálogo.

**Clientes variados para testar descontos:**

| Cliente | Flamengo | One Piece | Cidade | Desconto esperado |
|---|---|---|---|---|
| João Pedro | ✓ | ✓ | João Pessoa | 10% |
| Carlos Eduardo | ✓ | ✗ | Sousa | 10% |
| Ana Beatriz | ✓ | ✓ | Rio de Janeiro | 10% |
| Pedro Henrique | ✓ | ✓ | Sousa | 15% (máximo) |
| Lucas Gabriel | ✗ | ✗ | São Paulo | 0% |

---

## 4. Índices

Arquivo: [sql/03_indexes.sql](sql/03_indexes.sql)

### O que é um índice?

Um índice é uma estrutura de dados auxiliar que o banco mantém separada da tabela. Funciona como o índice remissivo de um livro: em vez de varrer cada página (cada linha da tabela) para encontrar um valor, o banco consulta a estrutura do índice e vai direto à posição correta.

Sem índice, uma busca por nome executa um **Sequential Scan** (lê todas as linhas). Com índice, executa um **Index Scan** (salta direto ao intervalo relevante). Em tabelas com milhares de registros, a diferença é de segundos para milissegundos.

O PostgreSQL usa por padrão índices do tipo **B-Tree** (árvore balanceada), que funciona para comparações de igualdade (`=`), intervalos (`BETWEEN`, `>=`, `<=`) e ordenações.

### Índices criados

```sql
-- Instrumentos: colunas usadas em filtros do catálogo
CREATE INDEX idx_instrumentos_categoria   ON instrumentos (categoria);
CREATE INDEX idx_instrumentos_preco       ON instrumentos (preco);
CREATE INDEX idx_instrumentos_fabricado   ON instrumentos (fabricado_em_serido);
CREATE INDEX idx_instrumentos_qtd_estoque ON instrumentos (qtd_estoque);
```

Esses índices cobrem os filtros da rota `/instrumentos/filtrar`: busca por categoria, faixa de preço, flag de fabricação regional e filtro de estoque baixo.

```sql
-- Clientes: busca e agrupamentos em relatórios
CREATE INDEX idx_clientes_cidade  ON clientes (lower(cidade));
CREATE INDEX idx_clientes_estado  ON clientes (estado);
```

`lower(cidade)` é um **índice de expressão** (functional index). Como a comparação na stored procedure usa `LOWER(v_cidade) = 'sousa'`, o índice precisa ser criado sobre a expressão `lower(cidade)` para ser aproveitado. Um índice sobre a coluna bruta `cidade` não seria usado em comparações case-insensitive.

```sql
-- Compras: joins e relatório mensal
CREATE INDEX idx_compras_id_cliente  ON compras (id_cliente);
CREATE INDEX idx_compras_id_vendedor ON compras (id_vendedor);
CREATE INDEX idx_compras_data_compra ON compras (data_compra);
```

Nas queries de JOIN (compras de um cliente, relatório por vendedor), o PostgreSQL precisa localizar linhas em `compras` pelo valor de `id_cliente` ou `id_vendedor`. Sem índice, seria um Sequential Scan na tabela inteira de compras.

```sql
-- Itens e pagamentos: joins
CREATE INDEX idx_itens_compra_id_compra      ON itens_compra (id_compra);
CREATE INDEX idx_itens_compra_id_instrumento ON itens_compra (id_instrumento);
CREATE INDEX idx_pagamentos_id_compra        ON pagamentos (id_compra);
```

Toda coluna de chave estrangeira que aparece em JOINs frequentes deve ter índice. O PostgreSQL não cria índices automaticamente em FKs (diferente do MySQL), então é necessário criá-los explicitamente.

> **Nota:** O PostgreSQL já cria automaticamente um índice B-Tree em colunas `PRIMARY KEY` e `UNIQUE`. Por isso não precisamos criar índice em `id`, `email`, `cpf`, etc.

---

## 5. View

Arquivo: [sql/04_views.sql](sql/04_views.sql)

### O que é uma View?

Uma view é uma **query nomeada e armazenada** no banco de dados. Ela não armazena dados — é apenas uma "janela" que, quando consultada, executa a query subjacente em tempo real. Vantagens:

- **Abstração:** quem consulta a view não precisa saber como os dados estão distribuídos nas tabelas
- **Reutilização:** a mesma query complexa pode ser usada em vários lugares sem repetição
- **Segurança:** pode-se dar acesso a uma view sem expor as tabelas base
- **Manutenção:** se a estrutura das tabelas mudar, só a view precisa ser atualizada

### A view `vw_vendas_mensais_por_vendedor`

```sql
CREATE OR REPLACE VIEW vw_vendas_mensais_por_vendedor AS
SELECT
    v.id                                        AS id_vendedor,
    v.nome                                      AS vendedor,
    EXTRACT(YEAR  FROM c.data_compra)::INTEGER  AS ano,
    EXTRACT(MONTH FROM c.data_compra)::INTEGER  AS mes,
    COUNT(c.id)                                 AS qtd_vendas,
    SUM(c.valor_total)                          AS total_vendas,
    AVG(c.valor_total)                          AS ticket_medio
FROM vendedores v
JOIN compras c ON c.id_vendedor = v.id
GROUP BY
    v.id,
    v.nome,
    EXTRACT(YEAR  FROM c.data_compra),
    EXTRACT(MONTH FROM c.data_compra)
ORDER BY ano DESC, mes DESC, total_vendas DESC;
```

**Dissecando a query:**

`EXTRACT(YEAR FROM c.data_compra)` — extrai o componente ano de uma data. Para uma data `2025-03-15`, retorna `2025`. O cast `::INTEGER` converte o resultado (que o PostgreSQL retorna como `NUMERIC`) para inteiro puro.

`JOIN compras c ON c.id_vendedor = v.id` — um `INNER JOIN`. Só aparecerão na view vendedores que têm ao menos uma compra associada. Vendedores sem compras são excluídos automaticamente (para incluí-los, usaríamos `LEFT JOIN`).

`GROUP BY v.id, v.nome, EXTRACT(...), EXTRACT(...)` — agrupa todas as compras do mesmo vendedor no mesmo mês/ano em uma única linha. Todas as colunas do `SELECT` que não são funções de agregação (`COUNT`, `SUM`, `AVG`) precisam aparecer no `GROUP BY`.

`COUNT(c.id)` — conta quantas compras existem no grupo.

`SUM(c.valor_total)` — soma o valor de todas as compras do grupo.

`AVG(c.valor_total)` — calcula o ticket médio (valor médio por compra) do grupo.

`ORDER BY ano DESC, mes DESC, total_vendas DESC` — ordena do mais recente para o mais antigo, e dentro do mesmo mês, do vendedor com maior volume para o menor.

**Como o backend consome a view:**

```python
# crud.py — RelatorioCRUD.relatorio_vendas_mensais()
query = "SELECT * FROM vw_vendas_mensais_por_vendedor"
if conditions:
    query += " WHERE " + " AND ".join(conditions)
```

O backend simplesmente lê a view como se fosse uma tabela (`SELECT * FROM vw_...`). Os filtros opcionais de ano e mês são adicionados dinamicamente com `WHERE`. A complexidade do JOIN e do GROUP BY está encapsulada dentro da view — o código Python não precisa saber nada disso.

---

## 6. Stored Procedure

Arquivo: [sql/05_procedures.sql](sql/05_procedures.sql)

### O que é uma Stored Procedure?

Uma stored procedure é um **bloco de código SQL armazenado no próprio banco de dados** que pode ser chamado por nome. Diferente de uma view (que é só uma query de leitura), uma procedure pode:

- Executar múltiplas operações (INSERT, UPDATE, SELECT)
- Conter lógica condicional (IF/ELSE)
- Declarar variáveis
- Lançar exceções
- Garantir atomicidade (tudo ou nada)

A linguagem usada aqui é **PL/pgSQL** (Procedural Language/PostgreSQL), que é a linguagem procedural nativa do PostgreSQL.

### A procedure `realizar_compra`

**Assinatura:**
```sql
CREATE OR REPLACE PROCEDURE realizar_compra(
    p_id_cliente         INTEGER,
    p_id_vendedor        INTEGER,
    p_id_forma_pagamento INTEGER,
    p_itens              JSONB,
    INOUT p_id_compra    INTEGER DEFAULT NULL
)
```

O parâmetro `INOUT` é especial: ele funciona tanto como entrada quanto como saída. Ao entrar, vale `NULL`. Ao sair, contém o ID da compra criada — é assim que o Python descobre qual ID foi gerado pelo banco.

`p_itens JSONB` — recebe os itens do carrinho como um array JSON. Por exemplo:
```json
[{"id_instrumento": 3, "qtd_item": 1}, {"id_instrumento": 7, "qtd_item": 2}]
```

Usar JSONB permite passar um número variável de itens em um único parâmetro, sem precisar de múltiplas chamadas.

**Declaração de variáveis:**
```sql
DECLARE
    v_desconto        NUMERIC := 0;
    v_valor_bruto     NUMERIC := 0;
    v_valor_total     NUMERIC := 0;
    v_item            JSONB;
    v_id_instrumento  INTEGER;
    v_qtd             INTEGER;
    v_preco           NUMERIC;
    v_estoque         INTEGER;
    v_torce_flamengo  BOOLEAN;
    v_assiste_op      BOOLEAN;
    v_cidade          VARCHAR;
```

Todas as variáveis são locais à procedure. A convenção `v_` no prefixo as distingue dos parâmetros (`p_`) e das colunas das tabelas.

**Passo 1 — Buscar dados do cliente:**
```sql
SELECT torce_flamengo, assiste_op, cidade
INTO v_torce_flamengo, v_assiste_op, v_cidade
FROM clientes
WHERE id = p_id_cliente;

IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente ID % não encontrado.', p_id_cliente;
END IF;
```

`SELECT ... INTO` é a forma de capturar o resultado de uma query em variáveis locais dentro do PL/pgSQL. `NOT FOUND` é uma variável especial do PostgreSQL que fica `TRUE` quando o SELECT anterior não retornou nenhuma linha. `RAISE EXCEPTION` interrompe a procedure e faz o banco lançar um erro — isso cancela toda a transação (rollback automático).

**Passo 2 — Calcular desconto:**
```sql
IF v_torce_flamengo          THEN v_desconto := v_desconto + 0.05; END IF;
IF v_assiste_op              THEN v_desconto := v_desconto + 0.05; END IF;
IF LOWER(v_cidade) = 'sousa' THEN v_desconto := v_desconto + 0.05; END IF;
```

Os três IFs são independentes (não `ELSE IF`), então todos podem acumular. O desconto máximo possível é `0.15` (15%). `LOWER()` normaliza a cidade para minúsculas antes de comparar, evitando que `Sousa`, `SOUSA` e `sousa` sejam tratados diferente.

**Passo 3 — Validar estoque e calcular valor bruto:**
```sql
FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
LOOP
    v_id_instrumento := (v_item->>'id_instrumento')::INTEGER;
    v_qtd            := (v_item->>'qtd_item')::INTEGER;

    SELECT preco, qtd_estoque
    INTO v_preco, v_estoque
    FROM instrumentos
    WHERE id = v_id_instrumento;

    IF v_estoque < v_qtd THEN
        RAISE EXCEPTION 'Estoque insuficiente para o instrumento ID % (disponível: %, solicitado: %).',
            v_id_instrumento, v_estoque, v_qtd;
    END IF;

    v_valor_bruto := v_valor_bruto + (v_preco * v_qtd);
END LOOP;
```

`jsonb_array_elements(p_itens)` — função do PostgreSQL que "explode" um array JSONB em linhas. Para `[{...}, {...}]`, retorna duas linhas, uma por objeto.

`v_item->>'id_instrumento'` — operador `->>'campo'` extrai um campo do JSONB como texto. O cast `::INTEGER` converte para inteiro.

O loop percorre cada item, valida o estoque antes de aceitar a compra e acumula o valor bruto total. Se qualquer item estiver sem estoque, a `EXCEPTION` interrompe tudo — a compra inteira é cancelada, nenhum item é debitado do estoque. Isso é **atomicidade**.

**Passo 4 — Aplicar desconto:**
```sql
v_valor_total := v_valor_bruto * (1 - v_desconto);
```

Se o desconto for `0.10` (10%), o fator é `0.90`. `10000 * 0.90 = 9000`.

**Passo 5 — Inserir a compra:**
```sql
INSERT INTO compras (id_cliente, id_vendedor, data_compra, valor_total, status_compra, desconto_aplicado)
VALUES (p_id_cliente, p_id_vendedor, CURRENT_DATE, v_valor_total, 'confirmada', v_desconto)
RETURNING id INTO p_id_compra;
```

`CURRENT_DATE` — função do PostgreSQL que retorna a data atual do servidor.

`RETURNING id INTO p_id_compra` — o INSERT retorna o ID gerado pelo `SERIAL` e o armazena na variável `p_id_compra` (que é `INOUT`, então esse valor volta para quem chamou a procedure).

**Passo 6 — Inserir itens e dar baixa no estoque:**
```sql
FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
LOOP
    -- busca o preço atual do instrumento
    SELECT preco INTO v_preco FROM instrumentos WHERE id = v_id_instrumento;

    INSERT INTO itens_compra (id_compra, id_instrumento, qtd_item, preco_unitario)
    VALUES (p_id_compra, v_id_instrumento, v_qtd, v_preco);

    UPDATE instrumentos
    SET qtd_estoque = qtd_estoque - v_qtd
    WHERE id = v_id_instrumento;
END LOOP;
```

O loop percorre os itens novamente para inserir cada um em `itens_compra` e decrementar o estoque. O preço é capturado novamente aqui para ser salvo como `preco_unitario` — garantindo o snapshot do preço no momento da compra.

**Passo 7 — Registrar pagamento:**
```sql
INSERT INTO pagamentos (id_compra, data_pagamento, status_pagamento, id_forma_pagamento)
VALUES (p_id_compra, CURRENT_DATE, 'pendente', p_id_forma_pagamento);
```

O pagamento começa sempre como `'pendente'` — a confirmação do pagamento seria um processo separado (integração com gateway de pagamento, por exemplo).

**Por que usar Procedure aqui e não SQL direto no Python?**

Toda a lógica acima (7 passos, 2 loops, validações) precisa ser **atômica**: ou tudo acontece, ou nada acontece. Se o Python executasse cada SQL separadamente e houvesse uma falha no meio (queda de rede, erro no quinto item), o banco ficaria em estado inconsistente — compra criada mas sem todos os itens, ou estoque decrementado mas compra não registrada. Dentro de uma procedure, o PostgreSQL envolve tudo em uma única transação implícita.

---

## 7. Backend — Conexão com o banco

Arquivo: [backend/database.py](backend/database.py)

```python
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
```

**psycopg2** é o driver padrão para conectar Python ao PostgreSQL. Ele implementa a DB-API 2.0 (PEP 249), a interface padrão de banco de dados para Python.

`os.getenv("DB_HOST", "localhost")` — lê a variável de ambiente `DB_HOST`. Se não estiver definida, usa `"localhost"`. Em produção (Docker Compose), `DB_HOST` é definido como o nome do serviço do banco (`db`). Em desenvolvimento local, cai no padrão `localhost`.

Cada rota do FastAPI chama `get_connection()`, usa a conexão e chama `conn.close()` ao final. Isso segue o padrão **open-use-close** por requisição. Uma alternativa mais robusta seria um pool de conexões (ex: `psycopg2.pool`), mas para um projeto acadêmico essa abordagem é suficiente.

---

## 8. Backend — Schemas (Pydantic)

Arquivo: [backend/schemas.py](backend/schemas.py)

Schemas são classes que definem a **forma esperada dos dados** nas requisições HTTP. O FastAPI usa a biblioteca **Pydantic** para validar automaticamente o JSON recebido antes de passar para a função da rota.

```python
from pydantic import BaseModel
from typing import Optional

class InstrumentoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = "Sem Descrição"
    preco: float
    ano_fabricacao: int
    categoria: str
    marca: str
    qtd_estoque: Optional[int] = 0
    fabricado_em_serido: Optional[bool] = False

class InstrumentoResponse(InstrumentoCreate):
    id: int
```

**`BaseModel`** — classe base do Pydantic. Ao herdar dela, a classe ganha validação automática de tipos, conversão de tipos e serialização para JSON.

**`Optional[str] = "Sem Descrição"`** — campo opcional com valor padrão. Se o cliente não enviar `descricao` no JSON, o valor `"Sem Descrição"` é usado.

**`InstrumentoResponse(InstrumentoCreate)`** — herda todos os campos de `InstrumentoCreate` e adiciona `id`. Assim, a resposta da API inclui o `id` gerado pelo banco, mas o request de criação não precisa enviar `id`.

**Schema de compra (estrutura aninhada):**
```python
class ItemCompraCreate(BaseModel):
    id_instrumento: int
    qtd_item: int

class CompraCreate(BaseModel):
    id_cliente: int
    id_vendedor: int
    id_forma_pagamento: int
    itens: list[ItemCompraCreate]
```

`itens: list[ItemCompraCreate]` — o JSON recebido deve ter um array de objetos, cada um validado pelo schema `ItemCompraCreate`. O Pydantic valida isso automaticamente. Se o cliente enviar um item com `qtd_item: "dois"` (string em vez de int), a API retorna `422 Unprocessable Entity` antes mesmo de chegar no código Python.

---

## 9. Backend — CRUD (queries detalhadas)

Arquivo: [backend/crud.py](backend/crud.py)

Cada entidade tem sua própria classe CRUD. Todas seguem o mesmo padrão:

```python
class AlgumCRUD:
    def __init__(self, connection):
        self.connection = connection
```

A conexão com o banco é injetada no construtor. Isso é **injeção de dependência** simples: a classe não sabe como a conexão foi criada, apenas a usa.

### Padrão de conversão de resultado em dicionário

```python
cursor.execute("SELECT * FROM instrumentos WHERE id = %s", (id,))
resultado = cursor.fetchone()
colunas = [desc[0] for desc in cursor.description]
return dict(zip(colunas, resultado))
```

`cursor.description` — atributo do cursor que contém metadados sobre as colunas retornadas: nome, tipo, tamanho. É uma lista de tuplas onde `desc[0]` é o nome da coluna.

`[desc[0] for desc in cursor.description]` — list comprehension que extrai só os nomes: `['id', 'nome', 'preco', ...]`.

`dict(zip(colunas, resultado))` — `zip` emparelha duas listas em pares `(chave, valor)`. `dict(...)` converte esses pares em um dicionário. Resultado: `{'id': 1, 'nome': 'Fender Stratocaster', 'preco': 45000.00, ...}`. O FastAPI serializa esse dicionário como JSON automaticamente.

### Queries parametrizadas — segurança contra SQL Injection

```python
cursor.execute("SELECT * FROM instrumentos WHERE id = %s", (id,))
```

O `%s` é um **placeholder parametrizado**. O psycopg2 nunca concatena o valor diretamente na string SQL — ele envia o valor separado para o PostgreSQL, que os une de forma segura internamente.

Se o código fosse assim:
```python
# ERRADO — vulnerável a SQL Injection
cursor.execute(f"SELECT * FROM instrumentos WHERE id = {id}")
```

Um atacante poderia passar `id = "1; DROP TABLE instrumentos; --"` e o banco executaria o DROP. Com `%s`, esse valor seria tratado como literal string, não como SQL.

**Nota:** a vírgula depois de `id` em `(id,)` é obrigatória — cria uma tupla com um elemento. Sem a vírgula, `(id)` é apenas parênteses em volta de um inteiro, não uma tupla, e o psycopg2 rejeitaria.

### ILIKE — busca case-insensitive

```python
cursor.execute("SELECT * FROM instrumentos WHERE nome ILIKE %s", (f"%{nome}%",))
```

`ILIKE` é a versão case-insensitive do `LIKE`. `LIKE '%fender%'` não encontraria `Fender`, mas `ILIKE '%fender%'` encontra.

`%{nome}%` — o `%` no SQL é o curinga "qualquer coisa". `%fender%` significa "qualquer coisa, depois fender, depois qualquer coisa" — ou seja, busca por substring. O f-string do Python monta a string `%fender%` que é passada como parâmetro.

### Filtros dinâmicos — construção de WHERE em tempo de execução

```python
def filtrar(self, nome=None, preco_min=None, preco_max=None,
            categoria=None, fabricado_em_serido=None, estoque_baixo=False):
    conditions = []
    params = []

    if nome:
        conditions.append("nome ILIKE %s")
        params.append(f"%{nome}%")
    if preco_min is not None:
        conditions.append("preco >= %s")
        params.append(preco_min)
    if preco_max is not None:
        conditions.append("preco <= %s")
        params.append(preco_max)
    if categoria:
        conditions.append("categoria ILIKE %s")
        params.append(f"%{categoria}%")
    if fabricado_em_serido is not None:
        conditions.append("fabricado_em_serido = %s")
        params.append(fabricado_em_serido)
    if estoque_baixo:
        conditions.append("qtd_estoque < 5")

    query = "SELECT * FROM instrumentos"
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY nome"

    cursor.execute(query, params)
```

Esse padrão resolve um problema clássico: como gerar um `WHERE` com número variável de condições sem escrever uma versão da query para cada combinação possível (seria exponencial).

`conditions` e `params` crescem juntos — cada condição adicionada ao `conditions` tem seu parâmetro correspondente adicionado ao `params` na mesma ordem. No final, `" AND ".join(conditions)` une as condições com `AND`. `cursor.execute(query, params)` substitui os `%s` pelos valores de `params` na mesma ordem.

Exemplo com `nome="fender"` e `preco_max=50000`:
```
conditions = ["nome ILIKE %s", "preco <= %s"]
params     = ["%fender%", 50000]
query      = "SELECT * FROM instrumentos WHERE nome ILIKE %s AND preco <= %s ORDER BY nome"
```

Isso ainda é seguro contra SQL Injection porque os valores vão como parâmetros, não como parte da string.

### Query complexa com JOIN e JSON_AGG

```python
cursor.execute("""
    SELECT
        c.id,
        c.data_compra,
        c.valor_total,
        c.status_compra,
        c.desconto_aplicado,
        v.nome             AS vendedor,
        fp.descricao       AS forma_pagamento,
        p.status_pagamento,
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id_instrumento', ic.id_instrumento,
                'nome',           i.nome,
                'qtd_item',       ic.qtd_item,
                'preco_unitario', ic.preco_unitario
            ) ORDER BY i.nome
        ) AS itens
    FROM compras c
    JOIN vendedores v          ON v.id  = c.id_vendedor
    LEFT JOIN pagamentos p     ON p.id_compra = c.id
    LEFT JOIN formas_pagamento fp ON fp.id = p.id_forma_pagamento
    LEFT JOIN itens_compra ic  ON ic.id_compra = c.id
    LEFT JOIN instrumentos i   ON i.id = ic.id_instrumento
    WHERE c.id_cliente = %s
    GROUP BY c.id, v.nome, fp.descricao, p.status_pagamento
    ORDER BY c.data_compra DESC
""", (id_cliente,))
```

Essa é a query mais complexa do projeto. Ela retorna todas as compras de um cliente com seus itens aninhados em uma única consulta, sem precisar de múltiplas queries.

**JOINs utilizados:**

- `JOIN vendedores v` — INNER JOIN, toda compra tem um vendedor.
- `LEFT JOIN pagamentos p` — LEFT JOIN porque teoricamente uma compra poderia existir sem pagamento registrado (embora na prática a procedure sempre crie ambos). LEFT JOIN garante que a compra apareça mesmo que o pagamento falte.
- `LEFT JOIN formas_pagamento fp` — encadeado com pagamentos para pegar a descrição da forma de pagamento.
- `LEFT JOIN itens_compra ic` — LEFT JOIN para que compras sem itens (situação anômala) ainda apareçam.
- `LEFT JOIN instrumentos i` — para pegar o nome do instrumento de cada item.

**`JSON_AGG` e `JSON_BUILD_OBJECT`:**

`JSON_BUILD_OBJECT('chave', valor, ...)` — constrói um objeto JSON a partir de pares chave-valor. Retorna algo como `{"id_instrumento": 3, "nome": "Selmer Mark VI", "qtd_item": 1, "preco_unitario": 52000.00}`.

`JSON_AGG(expressão ORDER BY ...)` — agrega vários valores em um array JSON. Como o GROUP BY agrupa todas as linhas de uma compra em uma, os múltiplos itens seriam "colapsados" — `JSON_AGG` os coleta em um array `[{item1}, {item2}, ...]`.

Resultado final por linha: uma compra com o campo `itens` contendo um array JSON de todos os seus itens. O Python não precisa fazer nenhuma montagem manual.

### Chamada da Stored Procedure

```python
def realizar(self, dados: CompraCreate):
    cursor = self.connection.cursor()
    itens_json = json.dumps([
        {"id_instrumento": item.id_instrumento, "qtd_item": item.qtd_item}
        for item in dados.itens
    ])
    cursor.execute(
        "CALL realizar_compra(%s, %s, %s, %s::jsonb, NULL)",
        (dados.id_cliente, dados.id_vendedor, dados.id_forma_pagamento, itens_json)
    )
    row = cursor.fetchone()
    self.connection.commit()
    cursor.close()
    return {"id_compra": row[0]} if row else None
```

`json.dumps([...])` — serializa a lista de itens para uma string JSON: `'[{"id_instrumento": 3, "qtd_item": 1}]'`.

`%s::jsonb` — o cast `::jsonb` instrui o PostgreSQL a interpretar a string recebida como JSONB (não apenas como texto).

`NULL` — o quinto parâmetro corresponde ao `INOUT p_id_compra`. Passa `NULL` como entrada; a procedure preenche com o ID criado.

`cursor.fetchone()` — após um `CALL` com parâmetros `INOUT`, o psycopg2 retorna uma linha com os valores de saída dos parâmetros INOUT. `row[0]` é o ID da compra.

`self.connection.commit()` — confirma a transação. Sem o `commit()`, as alterações ficam em um estado pendente e seriam desfeitas quando a conexão fosse fechada.

### RETURNING — capturar o que foi inserido

```python
cursor.execute(
    "INSERT INTO instrumentos (...) VALUES (%s, ...) RETURNING *",
    (dados.nome, ...)
)
resultado = cursor.fetchone()
```

`RETURNING *` é uma extensão do PostgreSQL ao SQL padrão. Um INSERT normalmente não retorna nada. Com `RETURNING`, o banco devolve as linhas inseridas — incluindo o `id` gerado pelo `SERIAL` e quaisquer valores padrão aplicados pelo banco. Isso evita ter que fazer um `SELECT` adicional logo após o `INSERT`.

---

## 10. Backend — API (rotas FastAPI)

Arquivo: [backend/main.py](backend/main.py)

### Configuração do CORS

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**CORS** (Cross-Origin Resource Sharing) é um mecanismo de segurança dos navegadores que bloqueia requisições de um domínio diferente do servidor. Como o frontend roda em `localhost:3000` e a API em `localhost:8000`, os domínios são diferentes (portas diferentes = origens diferentes). Sem esse middleware, o navegador bloquearia todas as requisições do frontend para a API. `allow_origins=["*"]` permite qualquer origem — adequado para desenvolvimento.

### Ordem das rotas importa

```python
@app.get("/clientes/busca-cpf")  # ← esta rota vem ANTES
def buscar_cliente_por_cpf(cpf: str): ...

@app.get("/clientes/{id}")       # ← esta vem DEPOIS
def buscar_cliente_por_id(id: int): ...
```

O FastAPI resolve rotas na ordem em que foram registradas. Se `/clientes/{id}` viesse primeiro, uma requisição para `/clientes/busca-cpf` seria capturada por ela (com `id = "busca-cpf"`), causando um erro. Rotas estáticas sempre devem ser registradas antes de rotas com parâmetros dinâmicos.

### Padrão de uma rota CRUD

```python
@app.post("/instrumentos", status_code=201)
def criar_instrumento(dados: InstrumentoCreate):
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.inserir(dados)
    conn.close()
    return resultado
```

`status_code=201` — código HTTP para "Created". O padrão do FastAPI é 200 (OK), mas semanticamente um POST que cria um recurso deve retornar 201.

`dados: InstrumentoCreate` — o FastAPI lê o corpo da requisição, valida contra o schema Pydantic e passa o objeto já validado e tipado para a função. Se a validação falhar, retorna 422 automaticamente.

`conn.close()` — sempre fechado ao final, mesmo que o `crud.inserir` falhe. Em uma implementação mais robusta, usaríamos `try/finally` para garantir o fechamento.

### Tratamento de erros na rota de compras

```python
@app.post("/compras", status_code=201)
def realizar_compra(dados: CompraCreate):
    conn = get_connection()
    crud = CompraCRUD(conn)
    try:
        resultado = crud.realizar(dados)
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))
    conn.close()
    return resultado
```

A stored procedure lança `RAISE EXCEPTION` quando o estoque é insuficiente. Essa exceção chega ao Python como um `psycopg2.errors.RaiseException`. O `except Exception as e` captura isso e transforma em `HTTPException(400)`. O `detail=str(e)` extrai a mensagem da exceção PostgreSQL (ex: `"Estoque insuficiente para o instrumento ID 14 (disponível: 0, solicitado: 1)"`) e a devolve no JSON de erro para o frontend exibir.

### Filtros opcionais com Query()

```python
@app.get("/instrumentos/filtrar")
def filtrar_instrumentos(
    nome:               Optional[str]   = Query(None),
    preco_min:          Optional[float] = Query(None),
    preco_max:          Optional[float] = Query(None),
    categoria:          Optional[str]   = Query(None),
    fabricado_em_serido: Optional[bool] = Query(None),
    estoque_baixo:      bool            = Query(False),
):
```

`Query(None)` instrui o FastAPI a ler esses parâmetros da query string da URL (ex: `/instrumentos/filtrar?nome=fender&preco_max=50000`). `Optional[float] = Query(None)` significa que o parâmetro é opcional e vale `None` se não enviado. O FastAPI converte `"50000"` (string da URL) para `float` automaticamente.

---

## 11. Fluxo completo de uma compra

Para entender como todas as camadas se conectam, veja o fluxo de uma requisição de compra do início ao fim:

```
1. Usuário preenche o formulário no frontend (Next.js)
   └── Seleciona cliente por CPF
   └── Adiciona instrumentos ao carrinho
   └── Seleciona vendedor e forma de pagamento
   └── Clica "Confirmar Compra"

2. Frontend chama realizarCompra() em api.ts
   └── POST http://localhost:8000/compras
   └── Body: { id_cliente: 3, id_vendedor: 1, id_forma_pagamento: 4,
               itens: [{ id_instrumento: 11, qtd_item: 1 }] }

3. FastAPI recebe a requisição em main.py
   └── Pydantic valida o body contra CompraCreate
   └── Instancia CompraCRUD e chama crud.realizar(dados)

4. crud.py serializa os itens para JSON
   └── json.dumps([{"id_instrumento": 11, "qtd_item": 1}])
   └── Executa: CALL realizar_compra(3, 1, 4, '[...]'::jsonb, NULL)

5. PostgreSQL executa a stored procedure
   └── Busca cliente ID 3 (Carlos Eduardo, Sousa, torce_flamengo=true)
   └── Calcula desconto: 0.05 (Flamengo) + 0.05 (Sousa) = 0.10 (10%)
   └── Valida estoque do instrumento 11 (Acordeão, estoque=2, pedido=1) → OK
   └── Valor bruto: R$ 12.000,00
   └── Valor total: R$ 12.000,00 × 0.90 = R$ 10.800,00
   └── INSERT INTO compras → id=1 (RETURNING)
   └── INSERT INTO itens_compra (compra=1, instrumento=11, qtd=1, preco=12000)
   └── UPDATE instrumentos SET qtd_estoque = 2 - 1 = 1
   └── INSERT INTO pagamentos (compra=1, status='pendente', forma=4)
   └── Retorna p_id_compra = 1

6. Python recebe row[0] = 1
   └── commit() confirma a transação
   └── Retorna {"id_compra": 1}

7. FastAPI serializa e devolve HTTP 201
   └── { "id_compra": 1 }

8. Frontend recebe a resposta
   └── Exibe "Compra #1 realizada com sucesso!"
   └── Limpa o carrinho
```

---

*Guia gerado em 2026-03-31 · Projeto BD I — Marketplace de Instrumentos Vintage*
