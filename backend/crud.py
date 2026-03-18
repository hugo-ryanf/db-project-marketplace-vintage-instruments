from schemas import InstrumentoCreate, ClienteCreate


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
