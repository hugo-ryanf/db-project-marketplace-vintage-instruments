import {
  Cliente,
  ClientePayload,
  Compra,
  FormaPagamento,
  Instrumento,
  InstrumentoPayload,
  RelatorioClientePorEstado,
  RelatorioInstrumentoPorCategoria,
  Vendedor,
  VendedorPayload,
  RelatorioVendasMensais,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Instrumentos ─────────────────────────────────────────────────────────────

export async function getInstrumentos(): Promise<Instrumento[]> {
  const res = await fetch(`${API_URL}/instrumentos`);
  if (!res.ok) throw new Error("Erro ao buscar instrumentos");
  return res.json();
}

export async function getInstrumento(id: number): Promise<Instrumento> {
  const res = await fetch(`${API_URL}/instrumentos/${id}`);
  if (!res.ok) throw new Error("Instrumento não encontrado");
  return res.json();
}

export async function searchInstrumentos(nome: string): Promise<Instrumento[]> {
  const res = await fetch(
    `${API_URL}/instrumentos/busca?nome=${encodeURIComponent(nome)}`
  );
  if (!res.ok) throw new Error("Erro ao buscar instrumentos");
  return res.json();
}

export interface FiltrosInstrumento {
  nome?: string;
  preco_min?: number;
  preco_max?: number;
  categoria?: string;
  fabricado_em_serido?: boolean;
  estoque_baixo?: boolean;
}

export async function filtrarInstrumentos(filtros: FiltrosInstrumento): Promise<Instrumento[]> {
  const params = new URLSearchParams();
  if (filtros.nome)               params.set("nome", filtros.nome);
  if (filtros.preco_min != null)  params.set("preco_min", String(filtros.preco_min));
  if (filtros.preco_max != null)  params.set("preco_max", String(filtros.preco_max));
  if (filtros.categoria)          params.set("categoria", filtros.categoria);
  if (filtros.fabricado_em_serido != null)
    params.set("fabricado_em_serido", String(filtros.fabricado_em_serido));
  if (filtros.estoque_baixo)      params.set("estoque_baixo", "true");

  const res = await fetch(`${API_URL}/instrumentos/filtrar?${params.toString()}`);
  if (!res.ok) throw new Error("Erro ao filtrar instrumentos");
  return res.json();
}

export async function createInstrumento(
  data: InstrumentoPayload
): Promise<Instrumento> {
  const res = await fetch(`${API_URL}/instrumentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar instrumento");
  return res.json();
}

export async function updateInstrumento(
  id: number,
  data: InstrumentoPayload
): Promise<Instrumento> {
  const res = await fetch(`${API_URL}/instrumentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar instrumento");
  return res.json();
}

export async function deleteInstrumento(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/instrumentos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar instrumento");
}

// ─── Clientes ─────────────────────────────────────────────────────────────────

export async function getClientes(): Promise<Cliente[]> {
  const res = await fetch(`${API_URL}/clientes`);
  if (!res.ok) throw new Error("Erro ao buscar clientes");
  return res.json();
}

export async function getCliente(id: number): Promise<Cliente> {
  const res = await fetch(`${API_URL}/clientes/${id}`);
  if (!res.ok) throw new Error("Cliente não encontrado");
  return res.json();
}

export async function searchClientes(nome: string): Promise<Cliente[]> {
  const res = await fetch(
    `${API_URL}/clientes/busca?nome=${encodeURIComponent(nome)}`
  );
  if (!res.ok) throw new Error("Erro ao buscar clientes");
  return res.json();
}

export async function createCliente(data: ClientePayload): Promise<Cliente> {
  const res = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar cliente");
  return res.json();
}

export async function updateCliente(
  id: number,
  data: ClientePayload
): Promise<Cliente> {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar cliente");
  return res.json();
}

export async function deleteCliente(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar cliente");
}

// ─── Relatórios ───────────────────────────────────────────────────────────────

export async function getRelatorioInstrumentosPorCategoria(): Promise<RelatorioInstrumentoPorCategoria[]> {
  const res = await fetch(`${API_URL}/relatorios/instrumentos-por-categoria`);
  if (!res.ok) throw new Error("Erro ao buscar relatório de instrumentos");
  return res.json();
}

export async function getRelatorioClientesPorEstado(): Promise<RelatorioClientePorEstado[]> {
  const res = await fetch(`${API_URL}/relatorios/clientes-por-estado`);
  if (!res.ok) throw new Error("Erro ao buscar relatório de clientes");
  return res.json();
}

export async function getRelatorioVendasMensais(ano?: number, mes?: number): Promise<RelatorioVendasMensais[]> {
  const params = new URLSearchParams();
  if (ano != null) params.set("ano", String(ano));
  if (mes != null) params.set("mes", String(mes));
  const res = await fetch(`${API_URL}/relatorios/vendas-mensais?${params.toString()}`);
  if (!res.ok) throw new Error("Erro ao buscar relatório de vendas");
  return res.json();
}

// ─── Vendedores ───────────────────────────────────────────────────────────────

export async function getVendedores(): Promise<Vendedor[]> {
  const res = await fetch(`${API_URL}/vendedores`);
  if (!res.ok) throw new Error("Erro ao buscar vendedores");
  return res.json();
}

export async function getVendedor(id: number): Promise<Vendedor> {
  const res = await fetch(`${API_URL}/vendedores/${id}`);
  if (!res.ok) throw new Error("Vendedor não encontrado");
  return res.json();
}

export async function searchVendedores(nome: string): Promise<Vendedor[]> {
  const res = await fetch(`${API_URL}/vendedores/busca?nome=${encodeURIComponent(nome)}`);
  if (!res.ok) throw new Error("Erro ao buscar vendedores");
  return res.json();
}

export async function createVendedor(data: VendedorPayload): Promise<Vendedor> {
  const res = await fetch(`${API_URL}/vendedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar vendedor");
  return res.json();
}

export async function updateVendedor(id: number, data: VendedorPayload): Promise<Vendedor> {
  const res = await fetch(`${API_URL}/vendedores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar vendedor");
  return res.json();
}

export async function deleteVendedor(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/vendedores/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar vendedor");
}

// ─── Clientes (extras) ────────────────────────────────────────────────────────

export async function getClienteByCpf(cpf: string): Promise<Cliente> {
  const res = await fetch(`${API_URL}/clientes/busca-cpf?cpf=${encodeURIComponent(cpf)}`);
  if (!res.ok) throw new Error("Cliente não encontrado");
  return res.json();
}

export async function getComprasDoCliente(id: number): Promise<Compra[]> {
  const res = await fetch(`${API_URL}/clientes/${id}/compras`);
  if (!res.ok) throw new Error("Erro ao buscar compras do cliente");
  return res.json();
}

// ─── Compras ──────────────────────────────────────────────────────────────────

export interface CompraPayload {
  id_cliente: number;
  id_vendedor: number;
  id_forma_pagamento: number;
  itens: { id_instrumento: number; qtd_item: number }[];
}

export async function realizarCompra(data: CompraPayload): Promise<{ id_compra: number }> {
  const res = await fetch(`${API_URL}/compras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Erro ao realizar compra");
  }
  return res.json();
}

// ─── Formas de Pagamento ──────────────────────────────────────────────────────

export async function getFormasPagamento(): Promise<FormaPagamento[]> {
  const res = await fetch(`${API_URL}/formas-pagamento`);
  if (!res.ok) throw new Error("Erro ao buscar formas de pagamento");
  return res.json();
}
