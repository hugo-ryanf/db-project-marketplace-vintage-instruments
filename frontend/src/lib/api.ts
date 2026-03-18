import {
  Cliente,
  ClientePayload,
  Instrumento,
  InstrumentoPayload,
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
