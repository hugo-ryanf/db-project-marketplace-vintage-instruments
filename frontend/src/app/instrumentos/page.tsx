"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instrumento } from "@/types";
import {
  deleteInstrumento,
  getInstrumento,
  getInstrumentos,
  searchInstrumentos,
} from "@/lib/api";
import Modal from "@/components/Modal";
import InstrumentoForm from "@/components/InstrumentoForm";

export default function InstrumentosPage() {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchId, setSearchId] = useState("");
  const [idError, setIdError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Instrumento | null>(null);
  const [foundById, setFoundById] = useState<Instrumento | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getInstrumentos();
      setInstrumentos(data);
    } catch {
      setError("Não foi possível carregar os instrumentos. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSearch() {
    if (!searchTerm.trim()) {
      load();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await searchInstrumentos(searchTerm);
      setInstrumentos(data);
    } catch {
      setError("Erro ao buscar instrumentos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchById() {
    const id = parseInt(searchId, 10);
    if (!searchId.trim() || isNaN(id)) {
      setIdError("Informe um ID válido.");
      return;
    }
    setIdError("");
    try {
      const data = await getInstrumento(id);
      setFoundById(data);
    } catch {
      setIdError(`Nenhum instrumento encontrado com ID ${id}.`);
    }
  }

  async function handleDelete(id: number, nome: string) {
    if (!window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      await deleteInstrumento(id);
      setInstrumentos((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Erro ao excluir instrumento.");
    }
  }

  async function handleDeleteFoundById() {
    if (!foundById) return;
    if (!window.confirm(`Excluir "${foundById.nome}"?`)) return;
    try {
      await deleteInstrumento(foundById.id);
      setFoundById(null);
      load();
    } catch {
      alert("Erro ao excluir instrumento.");
    }
  }

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(instrumento: Instrumento) {
    setEditing(instrumento);
    setShowModal(true);
  }

  function handleSaved() {
    setShowModal(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Instrumentos</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500"
        >
          + Novo Instrumento
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
        <button
          onClick={handleSearch}
          className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600"
        >
          Buscar
        </button>
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(""); load(); }}
            className="text-sm text-zinc-400 hover:text-zinc-200 px-2"
          >
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
          <button
            onClick={handleSearchById}
            className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600"
          >
            Buscar por ID
          </button>
        </div>
        {idError && (
          <p className="text-red-400 text-xs mt-1">{idError}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Carregando...</p>
      ) : instrumentos.length === 0 ? (
        <p className="text-zinc-500 text-sm">Nenhum instrumento encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-800 text-left">
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">ID</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Nome</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Categoria</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Marca</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Preço</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Estoque</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {instrumentos.map((inst) => (
                <tr key={inst.id} className="border-b border-zinc-700 hover:bg-zinc-800 bg-zinc-900">
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{inst.id}</td>
                  <td className="px-4 py-3 text-zinc-100 font-medium">{inst.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{inst.categoria}</td>
                  <td className="px-4 py-3 text-zinc-400">{inst.marca}</td>
                  <td className="px-4 py-3 text-zinc-200">
                    {inst.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-400">{inst.qtd_estoque}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/instrumentos/${inst.id}`}
                        className="bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-xs hover:bg-zinc-600"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => openEdit(inst)}
                        className="bg-amber-700 text-amber-100 px-2 py-1 rounded text-xs hover:bg-amber-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(inst.id, inst.nome)}
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
          title={editing ? "Editar Instrumento" : "Novo Instrumento"}
          onClose={() => setShowModal(false)}
        >
          <InstrumentoForm
            instrumento={editing ?? undefined}
            onSave={handleSaved}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {/* Modal: Resultado de busca por ID */}
      {foundById && (
        <Modal
          title={`Instrumento #${foundById.id}`}
          onClose={() => setFoundById(null)}
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-5">
            <div>
              <dt className="text-zinc-400 mb-1">Nome</dt>
              <dd className="text-zinc-100 font-medium">{foundById.nome}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Categoria</dt>
              <dd className="text-zinc-100">{foundById.categoria}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Marca</dt>
              <dd className="text-zinc-100">{foundById.marca}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Ano de Fabricação</dt>
              <dd className="text-zinc-100">{foundById.ano_fabricacao}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Preço</dt>
              <dd className="text-zinc-100 font-semibold">
                {foundById.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Estoque</dt>
              <dd className="text-zinc-100">{foundById.qtd_estoque} unidades</dd>
            </div>
            <div className="col-span-2 border-t border-zinc-700 pt-3">
              <dt className="text-zinc-400 mb-1">Descrição</dt>
              <dd className="text-zinc-200">{foundById.descricao || "Sem descrição"}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Fabricado em série</dt>
              <dd className="text-zinc-100">{foundById.fabricado_em_serido ? "Sim" : "Não"}</dd>
            </div>
          </dl>
          <div className="flex gap-2 border-t border-zinc-700 pt-4">
            <button
              onClick={() => {
                setFoundById(null);
                openEdit(foundById);
              }}
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
            <Link
              href={`/instrumentos/${foundById.id}`}
              className="bg-zinc-700 text-zinc-200 px-3 py-2 rounded text-sm hover:bg-zinc-600"
            >
              Ver página completa
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
