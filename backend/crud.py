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


