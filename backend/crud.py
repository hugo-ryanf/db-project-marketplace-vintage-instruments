import json
from schemas import InstrumentoCreate, ClienteCreate, VendedorCreate, CompraCreate


# CRUD de Instrumentos

class InstrumentoCRUD:
    def __init__(self, connection):
        self.connection = connection

    def inserir(self, dados: InstrumentoCreate):
        cursor = self.connection.cursor()
        cursor.execute(
            """INSERT INTO instrumentos 
            (nome, descricao, preco, ano_fabricacao, categoria, marca, qtd_estoque, fabricado_em_serido)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *""",
            (dados.nome, dados.descricao, dados.preco, dados.ano_fabricacao,
             dados.categoria, dados.marca, dados.qtd_estoque, dados.fabricado_em_serido)
        )
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        self.connection.commit()
        cursor.close()
        return dict(zip(colunas, resultado))

    def listar_todos(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM instrumentos")
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def buscar_por_id(self, id: int):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM instrumentos WHERE id = %s", (id,))
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        if resultado:
            return dict(zip(colunas, resultado))
        return None

    def buscar_por_nome(self, nome: str):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM instrumentos WHERE nome ILIKE %s", (f"%{nome}%",))
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

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

        cursor = self.connection.cursor()
        cursor.execute(query, params)
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def atualizar(self, id: int, dados: InstrumentoCreate):
        cursor = self.connection.cursor()
        cursor.execute(
            """UPDATE instrumentos 
            SET nome = %s, descricao = %s, preco = %s, ano_fabricacao = %s, 
                categoria = %s, marca = %s, qtd_estoque = %s, fabricado_em_serido = %s
            WHERE id = %s
            RETURNING *""",
            (dados.nome, dados.descricao, dados.preco, dados.ano_fabricacao,
             dados.categoria, dados.marca, dados.qtd_estoque, dados.fabricado_em_serido, id)
        )
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        self.connection.commit()
        cursor.close()
        if resultado:
            return dict(zip(colunas, resultado))
        return None

    def remover(self, id: int):
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM instrumentos WHERE id = %s", (id,))
        linhas_afetadas = cursor.rowcount
        self.connection.commit()
        cursor.close()
        return linhas_afetadas > 0


class ClienteCRUD:
    def __init__(self, connection):
        self.connection = connection

    def inserir(self, dados: ClienteCreate):
        cursor = self.connection.cursor()
        cursor.execute(
            """INSERT INTO clientes 
            (nome, email, telefone, cpf, endereco, cidade, estado, torce_flamengo, assiste_op)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *""",
            (dados.nome, dados.email, dados.telefone, dados.cpf,
             dados.endereco, dados.cidade, dados.estado, dados.torce_flamengo, dados.assiste_op)
        )
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        self.connection.commit()
        cursor.close()
        return dict(zip(colunas, resultado))

    def listar_todos(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM clientes")
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def buscar_por_id(self, id: int):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM clientes WHERE id = %s", (id,))
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        if resultado:
            return dict(zip(colunas, resultado))
        return None

    def buscar_por_cpf(self, cpf: str):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM clientes WHERE cpf = %s", (cpf,))
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        if resultado:
            return dict(zip(colunas, resultado))
        return None

    def buscar_por_nome(self, nome: str):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM clientes WHERE nome ILIKE %s", (f"%{nome}%",))
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def atualizar(self, id: int, dados: ClienteCreate):
        cursor = self.connection.cursor()
        cursor.execute(
            """UPDATE clientes 
            SET nome = %s, email = %s, telefone = %s, cpf = %s, 
                endereco = %s, cidade = %s, estado = %s, torce_flamengo = %s, assiste_op = %s
            WHERE id = %s
            RETURNING *""",
            (dados.nome, dados.email, dados.telefone, dados.cpf,
             dados.endereco, dados.cidade, dados.estado, dados.torce_flamengo, dados.assiste_op, id)
        )
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        self.connection.commit()
        cursor.close()
        if resultado:
            return dict(zip(colunas, resultado))
        return None

    def remover(self, id: int):
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM clientes WHERE id = %s", (id,))
        linhas_afetadas = cursor.rowcount
        self.connection.commit()
        cursor.close()
        return linhas_afetadas > 0


class CompraCRUD:
    def __init__(self, connection):
        self.connection = connection

    def realizar(self, dados: CompraCreate):
        """Chama a stored procedure realizar_compra e retorna o id_compra criado."""
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

    def listar_por_cliente(self, id_cliente: int):
        cursor = self.connection.cursor()
        cursor.execute(
            """SELECT
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
            ORDER BY c.data_compra DESC""",
            (id_cliente,)
        )
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def listar_formas_pagamento(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM formas_pagamento ORDER BY id")
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]


class VendedorCRUD:
    def __init__(self, connection):
        self.connection = connection

    def inserir(self, dados: VendedorCreate):
        cursor = self.connection.cursor()
        cursor.execute(
            """INSERT INTO vendedores (nome, email, telefone, cpf, data_admissao)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *""",
            (dados.nome, dados.email, dados.telefone, dados.cpf, dados.data_admissao)
        )
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        self.connection.commit()
        cursor.close()
        return dict(zip(colunas, resultado))

    def listar_todos(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM vendedores ORDER BY nome")
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def buscar_por_id(self, id: int):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM vendedores WHERE id = %s", (id,))
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        if resultado:
            return dict(zip(colunas, resultado))
        return None

    def buscar_por_nome(self, nome: str):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM vendedores WHERE nome ILIKE %s ORDER BY nome", (f"%{nome}%",))
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def atualizar(self, id: int, dados: VendedorCreate):
        cursor = self.connection.cursor()
        cursor.execute(
            """UPDATE vendedores
            SET nome = %s, email = %s, telefone = %s, cpf = %s, data_admissao = %s
            WHERE id = %s
            RETURNING *""",
            (dados.nome, dados.email, dados.telefone, dados.cpf, dados.data_admissao, id)
        )
        resultado = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        self.connection.commit()
        cursor.close()
        if resultado:
            return dict(zip(colunas, resultado))
        return None

    def remover(self, id: int):
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM vendedores WHERE id = %s", (id,))
        linhas_afetadas = cursor.rowcount
        self.connection.commit()
        cursor.close()
        return linhas_afetadas > 0


class RelatorioCRUD:
    def __init__(self, connection):
        self.connection = connection

    def relatorio_instrumentos_por_categoria(self):
        cursor = self.connection.cursor()
        cursor.execute(
            """SELECT
                categoria,
                COUNT(*)                 AS qtd_instrumentos,
                SUM(qtd_estoque)         AS total_estoque,
                SUM(preco * qtd_estoque) AS valor_total,
                AVG(preco)               AS preco_medio
            FROM instrumentos
            GROUP BY categoria
            ORDER BY qtd_instrumentos DESC"""
        )
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def relatorio_vendas_mensais(self, ano=None, mes=None):
        conditions = []
        params = []
        if ano is not None:
            conditions.append("ano = %s")
            params.append(ano)
        if mes is not None:
            conditions.append("mes = %s")
            params.append(mes)

        query = "SELECT * FROM vw_vendas_mensais_por_vendedor"
        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        cursor = self.connection.cursor()
        cursor.execute(query, params)
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]

    def relatorio_clientes_por_estado(self):
        cursor = self.connection.cursor()
        cursor.execute(
            """SELECT
                estado,
                COUNT(*)                                         AS qtd_clientes,
                SUM(CASE WHEN torce_flamengo THEN 1 ELSE 0 END) AS qtd_flamengo,
                SUM(CASE WHEN assiste_op     THEN 1 ELSE 0 END) AS qtd_one_piece
            FROM clientes
            GROUP BY estado
            ORDER BY qtd_clientes DESC"""
        )
        resultados = cursor.fetchall()
        colunas = [desc[0] for desc in cursor.description]
        cursor.close()
        return [dict(zip(colunas, row)) for row in resultados]
