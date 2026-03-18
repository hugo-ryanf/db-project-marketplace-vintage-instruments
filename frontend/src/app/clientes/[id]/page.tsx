"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Cliente } from "@/types";
import { deleteCliente, getCliente } from "@/lib/api";
import Modal from "@/components/Modal";
import ClienteForm from "@/components/ClienteForm";

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getCliente(id);
      setCliente(data);
    } catch {
      setError("Cliente não encontrado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function handleDelete() {
    if (!cliente) return;
    if (!window.confirm(`Excluir o cliente "${cliente.nome}"?`)) return;
    try {
      await deleteCliente(id);
      router.push("/clientes");
    } catch {
      alert("Erro ao excluir cliente.");
    }
  }

  if (loading) return <p className="text-zinc-500 text-sm">Carregando...</p>;
  if (error || !cliente)
    return (
      <div>
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <Link href="/clientes" className="text-blue-400 text-sm hover:underline">
          ← Voltar para lista
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clientes" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Voltar
        </Link>
        <h2 className="text-2xl font-bold text-zinc-100">{cliente.nome}</h2>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-6">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-zinc-400 mb-1">ID</dt>
            <dd className="text-zinc-100">{cliente.id}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Email</dt>
            <dd className="text-zinc-100">{cliente.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Telefone</dt>
            <dd className="text-zinc-100">{cliente.telefone}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">CPF</dt>
            <dd className="text-zinc-100">{cliente.cpf}</dd>
          </div>
          <div className="col-span-2 border-t border-zinc-700 pt-4">
            <dt className="text-zinc-400 mb-1">Endereço</dt>
            <dd className="text-zinc-100">{cliente.endereco}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Cidade</dt>
            <dd className="text-zinc-100">{cliente.cidade}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Estado</dt>
            <dd className="text-zinc-100">{cliente.estado}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Torce para o Flamengo</dt>
            <dd className="text-zinc-100">
              {cliente.torce_flamengo ? "Sim 🔴⚫" : "Não"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Assiste One Piece</dt>
            <dd className="text-zinc-100">
              {cliente.assiste_op ? "Sim ⚓" : "Não"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowEdit(true)}
          className="bg-amber-700 text-amber-100 px-4 py-2 rounded text-sm hover:bg-amber-600"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-800 text-red-200 px-4 py-2 rounded text-sm hover:bg-red-700"
        >
          Excluir
        </button>
      </div>

      {showEdit && (
        <Modal title="Editar Cliente" onClose={() => setShowEdit(false)}>
          <ClienteForm
            cliente={cliente}
            onSave={() => { setShowEdit(false); load(); }}
            onCancel={() => setShowEdit(false)}
          />
        </Modal>
      )}
    </div>
  );
}
