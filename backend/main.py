from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from database import get_connection
from crud import InstrumentoCRUD, ClienteCRUD, VendedorCRUD, CompraCRUD, RelatorioCRUD
from schemas import InstrumentoCreate, ClienteCreate, VendedorCreate, CompraCreate

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


@app.get("/instrumentos/filtrar")
def filtrar_instrumentos(
    nome:               Optional[str]   = Query(None),
    preco_min:          Optional[float] = Query(None),
    preco_max:          Optional[float] = Query(None),
    categoria:          Optional[str]   = Query(None),
    fabricado_em_serido: Optional[bool] = Query(None),
    estoque_baixo:      bool            = Query(False),
):
    conn = get_connection()
    crud = InstrumentoCRUD(conn)
    resultado = crud.filtrar(
        nome=nome,
        preco_min=preco_min,
        preco_max=preco_max,
        categoria=categoria,
        fabricado_em_serido=fabricado_em_serido,
        estoque_baixo=estoque_baixo,
    )
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


@app.get("/clientes/busca-cpf")
def buscar_cliente_por_cpf(cpf: str):
    conn = get_connection()
    crud = ClienteCRUD(conn)
    resultado = crud.buscar_por_cpf(cpf)
    conn.close()
    if resultado:
        return resultado
    raise HTTPException(status_code=404, detail="Cliente não encontrado")


@app.get("/clientes/{id}/compras")
def listar_compras_do_cliente(id: int):
    conn = get_connection()
    # verifica se cliente existe
    cliente = ClienteCRUD(conn).buscar_por_id(id)
    if not cliente:
        conn.close()
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    resultado = CompraCRUD(conn).listar_por_cliente(id)
    conn.close()
    return resultado


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


# Rotas de Vendedores

@app.post("/vendedores", status_code=201)
def criar_vendedor(dados: VendedorCreate):
    conn = get_connection()
    crud = VendedorCRUD(conn)
    resultado = crud.inserir(dados)
    conn.close()
    return resultado


@app.get("/vendedores")
def listar_vendedores():
    conn = get_connection()
    crud = VendedorCRUD(conn)
    resultado = crud.listar_todos()
    conn.close()
    return resultado


@app.get("/vendedores/busca")
def buscar_vendedor_por_nome(nome: str):
    conn = get_connection()
    crud = VendedorCRUD(conn)
    resultado = crud.buscar_por_nome(nome)
    conn.close()
    return resultado


@app.get("/vendedores/{id}")
def buscar_vendedor_por_id(id: int):
    conn = get_connection()
    crud = VendedorCRUD(conn)
    resultado = crud.buscar_por_id(id)
    conn.close()
    if resultado:
        return resultado
    raise HTTPException(status_code=404, detail="Vendedor não encontrado")


@app.put("/vendedores/{id}")
def atualizar_vendedor(id: int, dados: VendedorCreate):
    conn = get_connection()
    crud = VendedorCRUD(conn)
    resultado = crud.atualizar(id, dados)
    conn.close()
    if resultado:
        return resultado
    raise HTTPException(status_code=404, detail="Vendedor não encontrado")


@app.delete("/vendedores/{id}")
def deletar_vendedor(id: int):
    conn = get_connection()
    crud = VendedorCRUD(conn)
    resultado = crud.remover(id)
    conn.close()
    if resultado:
        return {"detail": "Vendedor removido com sucesso"}
    raise HTTPException(status_code=404, detail="Vendedor não encontrado")


# Rotas de Compras

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
    if resultado:
        return resultado
    raise HTTPException(status_code=500, detail="Erro ao registrar compra")


# Rotas de Formas de Pagamento

@app.get("/formas-pagamento")
def listar_formas_pagamento():
    conn = get_connection()
    crud = CompraCRUD(conn)
    resultado = crud.listar_formas_pagamento()
    conn.close()
    return resultado


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


@app.get("/relatorios/vendas-mensais")
def relatorio_vendas_mensais(
    ano: Optional[int] = Query(None),
    mes: Optional[int] = Query(None),
):
    conn = get_connection()
    crud = RelatorioCRUD(conn)
    resultado = crud.relatorio_vendas_mensais(ano=ano, mes=mes)
    conn.close()
    return resultado
