from pydantic import BaseModel
from typing import Optional

# Schemas de Instrumento
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

# Schemas de Cliente

class ClienteCreate(BaseModel):
    nome: str
    email: str
    telefone: str
    cpf: str
    endereco: str
    cidade: str
    estado: str
    torce_flamengo: Optional[bool] = False
    assiste_op: Optional[bool] = False


class ClienteResponse(ClienteCreate):
    id: int


# ─── Vendedor ─────────────────────────────────────────────────────────────────

class VendedorCreate(BaseModel):
    nome: str
    email: str
    telefone: Optional[str] = None
    cpf: str
    data_admissao: Optional[str] = None  # formato: YYYY-MM-DD


class VendedorResponse(VendedorCreate):
    id: int


# ─── Compra ───────────────────────────────────────────────────────────────────

class ItemCompraCreate(BaseModel):
    id_instrumento: int
    qtd_item: int


class CompraCreate(BaseModel):
    id_cliente: int
    id_vendedor: int
    id_forma_pagamento: int
    itens: list[ItemCompraCreate]