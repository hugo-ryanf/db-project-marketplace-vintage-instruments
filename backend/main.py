from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection
from crud import InstrumentoCRUD, ClienteCRUD, RelatorioCRUD
from schemas import InstrumentoCreate, ClienteCreate

app = FastAPI(
    title="Marketplace Vintage Instruments",
    description="API de instrumentos musicais antigos - Banco de Dados I"
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rota raiz (teste)

@app.get("/")
def raiz():
    return {"mensagem": "API Marketplace Vintage Instruments funcionando!"}


# Rotas de Instrumentos
 
@app.post("/instrumentos", status_code=201)
def criar_instrumento(dados: InstrumentoCreate):
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.inserir(dados)
    conn.close()
    return resultado


@app.get("/instrumentos")
def listar_instrumentos():
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.listar_todos()
    conn.close()
    return resultado


@app.get("/instrumentos/busca")
def buscar_instrumento_por_nome(nome: str):
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.buscar_por_nome(nome)
    conn.close()
    return resultado


@app.get("/instrumentos/{id}")
def buscar_instrumento_por_id(id: int):
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.buscar_por_id(id)
    conn.close()
    if resultado:
        return resultado
    raise HTTPException(status_code=404, detail="Instrumento não encontrado")


@app.put("/instrumentos/{id}")
def atualizar_instrumento(id: int, dados: InstrumentoCreate):
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.atualizar(id, dados)
    conn.close()
    if resultado:
        return resultado
    raise HTTPException(status_code=404, detail="Instrumento não encontrado")


@app.delete("/instrumentos/{id}")
def deletar_instrumento(id: int):
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.remover(id)
    conn.close()
    if resultado:
        return {"detail": "Instrumento removido com sucesso"}
    raise HTTPException(status_code=404, detail="Instrumento não encontrado")

# Rotas de Clientes 


@app.post("/clientes", status_code=201)
def criar_cliente(dados: ClienteCreate):
    conn = get_connection()
    crud = ClienteCRUD(conn)
    resultado = crud.inserir(dados)
    conn.close()
    return resultado


@app.get("/clientes")
def listar_clientes():
    conn = get_connection()
    crud = ClienteCRUD(conn)
    resultado = crud.listar_todos()
    conn.close()
    return resultado


@app.get("/clientes/busca")
def buscar_cliente_por_nome(nome: str):
    conn = get_connection()
    crud = ClienteCRUD(conn)
    resultado = crud.buscar_por_nome(nome)
    conn.close()
    return resultado


@app.get("/clientes/{id}")
def buscar_cliente_por_id(id: int):
    conn = get_connection()
    crud = ClienteCRUD(conn)
    resultado = crud.buscar_por_id(id)
    conn.close()
    if resultado:
        return resultado
    raise HTTPException(status_code=404, detail="Cliente não encontrado")


@app.put("/clientes/{id}")
def atualizar_cliente(id: int, dados: ClienteCreate):
    conn = get_connection()
    crud = ClienteCRUD(conn)
    resultado = crud.atualizar(id, dados)
    conn.close()
    if resultado:
        return resultado
    raise HTTPException(status_code=404, detail="Cliente não encontrado")


@app.delete("/clientes/{id}")
def deletar_cliente(id: int):
    conn = get_connection()
    crud = ClienteCRUD(conn)
    resultado = crud.remover(id)
    conn.close()
    if resultado:
        return {"detail": "Cliente removido com sucesso"}
    raise HTTPException(status_code=404, detail="Cliente não encontrado")


# Rotas de Relatórios

@app.get("/relatorios/instrumentos-por-categoria")
def relatorio_instrumentos_por_categoria():
    conn = get_connection()
    crud = RelatorioCRUD(conn)
    resultado = crud.relatorio_instrumentos_por_categoria()
    conn.close()
    return resultado


@app.get("/relatorios/clientes-por-estado")
def relatorio_clientes_por_estado():
    conn = get_connection()
    crud = RelatorioCRUD(conn)
    resultado = crud.relatorio_clientes_por_estado()
    conn.close()
    return resultado
