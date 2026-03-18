"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cliente } from "@/types";
import {
  deleteCliente,
  getCliente,
  getClientes,
  searchClientes,
} from "@/lib/api";
import Modal from "@/components/Modal";
import ClienteForm from "@/components/ClienteForm";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchId, setSearchId] = useState("");
  const [idError, setIdError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [foundById, setFoundById] = useState<Cliente | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getClientes();
      setClientes(data);
    } catch {
      setError("Não foi possível carregar os clientes. Verifique se o backend está rodando.");
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
      const data = await searchClientes(searchTerm);
      setClientes(data);
    } catch {
      setError("Erro ao buscar clientes.");
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
      const data = await getCliente(id);
      setFoundById(data);
    } catch {
      setIdError(`Nenhum cliente encontrado com ID ${id}.`);
    }
  }

  async function handleDelete(id: number, nome: string) {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) return;
    try {
      await deleteCliente(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Erro ao excluir cliente.");
    }
  }

  async function handleDeleteFoundById() {
    if (!foundById) return;
    if (!window.confirm(`Excluir o cliente "${foundById.nome}"?`)) return;
    try {
      await deleteCliente(foundById.id);
      setFoundById(null);
      load();
    } catch {
      alert("Erro ao excluir cliente.");
    }
  }

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(cliente: Cliente) {
    setEditing(cliente);
    setShowModal(true);
  }

  function handleSaved() {
    setShowModal(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Clientes</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500"
        >
          + Novo Cliente
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
      ) : clientes.length === 0 ? (
        <p className="text-zinc-500 text-sm">Nenhum cliente encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-800 text-left">
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">ID</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Nome</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Email</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">CPF</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Cidade</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Estado</th>
                <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cli) => (
                <tr key={cli.id} className="border-b border-zinc-700 hover:bg-zinc-800 bg-zinc-900">
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{cli.id}</td>
                  <td className="px-4 py-3 text-zinc-100 font-medium">{cli.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{cli.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{cli.cpf}</td>
                  <td className="px-4 py-3 text-zinc-400">{cli.cidade}</td>
                  <td className="px-4 py-3 text-zinc-400">{cli.estado}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/clientes/${cli.id}`}
                        className="bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-xs hover:bg-zinc-600"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => openEdit(cli)}
                        className="bg-amber-700 text-amber-100 px-2 py-1 rounded text-xs hover:bg-amber-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cli.id, cli.nome)}
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
          title={editing ? "Editar Cliente" : "Novo Cliente"}
          onClose={() => setShowModal(false)}
        >
          <ClienteForm
            cliente={editing ?? undefined}
            onSave={handleSaved}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {/* Modal: Resultado de busca por ID */}
      {foundById && (
        <Modal
          title={`Cliente #${foundById.id}`}
          onClose={() => setFoundById(null)}
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-5">
            <div>
              <dt className="text-zinc-400 mb-1">Nome</dt>
              <dd className="text-zinc-100 font-medium">{foundById.nome}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Email</dt>
              <dd className="text-zinc-100">{foundById.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Telefone</dt>
              <dd className="text-zinc-100">{foundById.telefone}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">CPF</dt>
              <dd className="text-zinc-100">{foundById.cpf}</dd>
            </div>
            <div className="col-span-2 border-t border-zinc-700 pt-3">
              <dt className="text-zinc-400 mb-1">Endereço</dt>
              <dd className="text-zinc-100">{foundById.endereco}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Cidade</dt>
              <dd className="text-zinc-100">{foundById.cidade}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Estado</dt>
              <dd className="text-zinc-100">{foundById.estado}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Torce para o Flamengo</dt>
              <dd className="text-zinc-100">{foundById.torce_flamengo ? "Sim 🔴⚫" : "Não"}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Assiste One Piece</dt>
              <dd className="text-zinc-100">{foundById.assiste_op ? "Sim ⚓" : "Não"}</dd>
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
              href={`/clientes/${foundById.id}`}
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
