"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Instrumento } from "@/types";
import { deleteInstrumento, getInstrumento } from "@/lib/api";
import Modal from "@/components/Modal";
import InstrumentoForm from "@/components/InstrumentoForm";

export default function InstrumentoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [instrumento, setInstrumento] = useState<Instrumento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getInstrumento(id);
      setInstrumento(data);
    } catch {
      setError("Instrumento não encontrado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function handleDelete() {
    if (!instrumento) return;
    if (!window.confirm(`Excluir "${instrumento.nome}"?`)) return;
    try {
      await deleteInstrumento(id);
      router.push("/instrumentos");
    } catch {
      alert("Erro ao excluir instrumento.");
    }
  }

  if (loading) return <p className="text-zinc-500 text-sm">Carregando...</p>;
  if (error || !instrumento)
    return (
      <div>
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <Link href="/instrumentos" className="text-blue-400 text-sm hover:underline">
          ← Voltar para lista
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/instrumentos" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Voltar
        </Link>
        <h2 className="text-2xl font-bold text-zinc-100">{instrumento.nome}</h2>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-6">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-zinc-400 mb-1">ID</dt>
            <dd className="text-zinc-100">{instrumento.id}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Categoria</dt>
            <dd className="text-zinc-100">{instrumento.categoria}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Marca</dt>
            <dd className="text-zinc-100">{instrumento.marca}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Ano de Fabricação</dt>
            <dd className="text-zinc-100">{instrumento.ano_fabricacao}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Preço</dt>
            <dd className="text-zinc-100 font-semibold text-base">
              {instrumento.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Estoque</dt>
            <dd className="text-zinc-100">{instrumento.qtd_estoque} unidades</dd>
          </div>
          <div className="col-span-2 border-t border-zinc-700 pt-4">
            <dt className="text-zinc-400 mb-1">Descrição</dt>
            <dd className="text-zinc-200">{instrumento.descricao || "Sem descrição"}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 mb-1">Fabricado em série</dt>
            <dd className="text-zinc-100">{instrumento.fabricado_em_serido ? "Sim" : "Não"}</dd>
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
        <Modal title="Editar Instrumento" onClose={() => setShowEdit(false)}>
          <InstrumentoForm
            instrumento={instrumento}
            onSave={() => { setShowEdit(false); load(); }}
            onCancel={() => setShowEdit(false)}
          />
        </Modal>
      )}
    </div>
  );
}
