"use client";

import { useEffect, useState } from "react";
import { Vendedor } from "@/types";
import { deleteVendedor, getVendedor, getVendedores, searchVendedores } from "@/lib/api";
import Modal from "@/components/Modal";
import VendedorForm from "@/components/VendedorForm";

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchId, setSearchId] = useState("");
  const [idError, setIdError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vendedor | null>(null);
  const [foundById, setFoundById] = useState<Vendedor | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getVendedores();
      setVendedores(data);
    } catch {
      setError("Não foi possível carregar os vendedores. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSearch() {
    if (!searchTerm.trim()) { load(); return; }
    setLoading(true);
    setError("");
    try {
      const data = await searchVendedores(searchTerm);
      setVendedores(data);
    } catch {
      setError("Erro ao buscar vendedores.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchById() {
    const id = parseInt(searchId, 10);
    if (!searchId.trim() || isNaN(id)) { setIdError("Informe um ID válido."); return; }
    setIdError("");
    try {
      const data = await getVendedor(id);
      setFoundById(data);
    } catch {
      setIdError(`Nenhum vendedor encontrado com ID ${id}.`);
    }
  }

  async function handleDelete(id: number, nome: string) {
    if (!window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      await deleteVendedor(id);
      setVendedores((prev) => prev.filter((v) => v.id !== id));
    } catch {
      alert("Erro ao excluir vendedor.");
    }
  }

  async function handleDeleteFoundById() {
    if (!foundById) return;
    if (!window.confirm(`Excluir "${foundById.nome}"?`)) return;
    try {
      await deleteVendedor(foundById.id);
      setFoundById(null);
      load();
    } catch {
      alert("Erro ao excluir vendedor.");
    }
  }

  function openCreate() { setEditing(null); setShowModal(true); }
  function openEdit(v: Vendedor) { setEditing(v); setShowModal(true); }
  function handleSaved() { setShowModal(false); load(); }

  function formatDate(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Vendedores</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500"
        >
          + Novo Vendedor
        </button>
      </div>

      {/* Busca por nome */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 flex-1 focus:outline-none focus:border-zinc-500"
        />
        <button onClick={handleSearch} className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600">
          Buscar
        </button>
        {searchTerm && (
          <button onClick={() => { setSearchTerm(""); load(); }} className="text-sm text-zinc-400 hover:text-zinc-200 px-2">
            Limpar
          </button>
        )}
      </div>

      {/* Busca por ID */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Buscar por ID..."
            value={searchId}
            onChange={(e) => { setSearchId(e.target.value); setIdError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearchById()}
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 w-48 focus:outline-none focus:border-zinc-500"
          />
          <button onClick={handleSearchById} className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600">
            Buscar por ID
          </button>
        </div>
        {idError && <p className="text-red-400 text-xs mt-1">{idError}</p>}
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Carregando...</p>
      ) : vendedores.length === 0 ? (
        <p className="text-zinc-500 text-sm">Nenhum vendedor encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-800 text-left">
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">ID</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Nome</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">E-mail</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">CPF</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Telefone</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Admissão</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((v) => (
                <tr key={v.id} className="border-b border-zinc-700 hover:bg-zinc-800 bg-zinc-900">
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{v.id}</td>
                  <td className="px-4 py-3 text-zinc-100 font-medium">{v.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{v.email}</td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{v.cpf}</td>
                  <td className="px-4 py-3 text-zinc-400">{v.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(v.data_admissao)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(v)}
                        className="bg-amber-700 text-amber-100 px-2 py-1 rounded text-xs hover:bg-amber-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.nome)}
                        className="bg-red-800 text-red-200 px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Novo / Editar */}
      {showModal && (
        <Modal
          title={editing ? "Editar Vendedor" : "Novo Vendedor"}
          onClose={() => setShowModal(false)}
        >
          <VendedorForm
            vendedor={editing ?? undefined}
            onSave={handleSaved}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {/* Modal: Resultado busca por ID */}
      {foundById && (
        <Modal title={`Vendedor #${foundById.id}`} onClose={() => setFoundById(null)}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-5">
            <div>
              <dt className="text-zinc-400 mb-1">Nome</dt>
              <dd className="text-zinc-100 font-medium">{foundById.nome}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">E-mail</dt>
              <dd className="text-zinc-100">{foundById.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">CPF</dt>
              <dd className="text-zinc-100 font-mono">{foundById.cpf}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Telefone</dt>
              <dd className="text-zinc-100">{foundById.telefone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Data de Admissão</dt>
              <dd className="text-zinc-100">{formatDate(foundById.data_admissao)}</dd>
            </div>
          </dl>
          <div className="flex gap-2 border-t border-zinc-700 pt-4">
            <button
              onClick={() => { setFoundById(null); openEdit(foundById); }}
              className="bg-amber-700 text-amber-100 px-3 py-2 rounded text-sm hover:bg-amber-600"
            >
              Editar
            </button>
            <button
              onClick={handleDeleteFoundById}
              className="bg-red-800 text-red-200 px-3 py-2 rounded text-sm hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
