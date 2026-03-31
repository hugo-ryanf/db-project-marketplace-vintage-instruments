"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instrumento } from "@/types";
import {
  deleteInstrumento,
  filtrarInstrumentos,
  getInstrumento,
  getInstrumentos,
  FiltrosInstrumento,
} from "@/lib/api";
import Modal from "@/components/Modal";
import InstrumentoForm from "@/components/InstrumentoForm";

const FILTROS_VAZIOS: FiltrosInstrumento = {
  nome: "",
  preco_min: undefined,
  preco_max: undefined,
  categoria: "",
  fabricado_em_serido: undefined,
  estoque_baixo: false,
};

export default function InstrumentosPage() {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros
  const [filtros, setFiltros] = useState<FiltrosInstrumento>(FILTROS_VAZIOS);
  const [modoFuncionario, setModoFuncionario] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState(false);

  // busca por ID
  const [searchId, setSearchId] = useState("");
  const [idError, setIdError] = useState("");

  // modais
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

  useEffect(() => { load(); }, []);

  async function handleFiltrar() {
    const filtrosParaEnviar = { ...filtros };
    if (modoFuncionario) filtrosParaEnviar.estoque_baixo = true;

    const temFiltro =
      filtrosParaEnviar.nome ||
      filtrosParaEnviar.preco_min != null ||
      filtrosParaEnviar.preco_max != null ||
      filtrosParaEnviar.categoria ||
      filtrosParaEnviar.fabricado_em_serido != null ||
      filtrosParaEnviar.estoque_baixo;

    setLoading(true);
    setError("");
    try {
      const data = temFiltro
        ? await filtrarInstrumentos(filtrosParaEnviar)
        : await getInstrumentos();
      setInstrumentos(data);
      setFiltrosAtivos(!!temFiltro);
    } catch {
      setError("Erro ao buscar instrumentos.");
    } finally {
      setLoading(false);
    }
  }

  function handleLimparFiltros() {
    setFiltros(FILTROS_VAZIOS);
    setModoFuncionario(false);
    setFiltrosAtivos(false);
    load();
  }

  async function handleSearchById() {
    const id = parseInt(searchId, 10);
    if (!searchId.trim() || isNaN(id)) { setIdError("Informe um ID válido."); return; }
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

  function openCreate() { setEditing(null); setShowModal(true); }
  function openEdit(i: Instrumento) { setEditing(i); setShowModal(true); }
  function handleSaved() { setShowModal(false); load(); }

  const inputCls = "bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Instrumentos</h2>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500">
          + Novo Instrumento
        </button>
      </div>

      {/* ── Painel de Filtros ── */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-3">Filtros de busca</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Nome..."
            value={filtros.nome ?? ""}
            onChange={(e) => setFiltros((p) => ({ ...p, nome: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleFiltrar()}
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Categoria..."
            value={filtros.categoria ?? ""}
            onChange={(e) => setFiltros((p) => ({ ...p, categoria: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleFiltrar()}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Preço mínimo (R$)"
            value={filtros.preco_min ?? ""}
            onChange={(e) => setFiltros((p) => ({ ...p, preco_min: e.target.value ? Number(e.target.value) : undefined }))}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Preço máximo (R$)"
            value={filtros.preco_max ?? ""}
            onChange={(e) => setFiltros((p) => ({ ...p, preco_max: e.target.value ? Number(e.target.value) : undefined }))}
            className={inputCls}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-3 text-sm">
          <select
            value={filtros.fabricado_em_serido == null ? "" : String(filtros.fabricado_em_serido)}
            onChange={(e) =>
              setFiltros((p) => ({
                ...p,
                fabricado_em_serido: e.target.value === "" ? undefined : e.target.value === "true",
              }))
            }
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
          >
            <option value="">Fabricado no Seridó: todos</option>
            <option value="true">Sim — fabricado no Seridó</option>
            <option value="false">Não fabricado no Seridó</option>
          </select>

          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={modoFuncionario}
              onChange={(e) => setModoFuncionario(e.target.checked)}
              className="accent-blue-500 w-4 h-4"
            />
            <span>Modo funcionário <span className="text-zinc-500">(estoque &lt; 5)</span></span>
          </label>
        </div>

        <div className="flex gap-2">
          <button onClick={handleFiltrar} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500">
            Buscar
          </button>
          {filtrosAtivos && (
            <button onClick={handleLimparFiltros} className="bg-zinc-700 text-zinc-300 px-4 py-2 rounded text-sm hover:bg-zinc-600">
              Limpar filtros
            </button>
          )}
        </div>
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
            className={`${inputCls} w-48`}
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

      {filtrosAtivos && (
        <p className="text-zinc-500 text-xs mb-3">{instrumentos.length} resultado(s) encontrado(s)</p>
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
                <tr
                  key={inst.id}
                  className={`border-b border-zinc-700 hover:bg-zinc-800 bg-zinc-900 ${
                    inst.qtd_estoque < 5 ? "border-l-2 border-l-amber-600" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{inst.id}</td>
                  <td className="px-4 py-3 text-zinc-100 font-medium">
                    {inst.nome}
                    {inst.fabricado_em_serido && (
                      <span className="ml-2 text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">Seridó</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{inst.categoria}</td>
                  <td className="px-4 py-3 text-zinc-400">{inst.marca}</td>
                  <td className="px-4 py-3 text-zinc-200">
                    {inst.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className={`px-4 py-3 text-center font-medium ${inst.qtd_estoque < 5 ? "text-amber-400" : "text-zinc-400"}`}>
                    {inst.qtd_estoque}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/instrumentos/${inst.id}`} className="bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-xs hover:bg-zinc-600">
                        Ver
                      </Link>
                      <button onClick={() => openEdit(inst)} className="bg-amber-700 text-amber-100 px-2 py-1 rounded text-xs hover:bg-amber-600">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(inst.id, inst.nome)} className="bg-red-800 text-red-200 px-2 py-1 rounded text-xs hover:bg-red-700">
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
        <Modal title={editing ? "Editar Instrumento" : "Novo Instrumento"} onClose={() => setShowModal(false)}>
          <InstrumentoForm instrumento={editing ?? undefined} onSave={handleSaved} onCancel={() => setShowModal(false)} />
        </Modal>
      )}

      {/* Modal: Resultado busca por ID */}
      {foundById && (
        <Modal title={`Instrumento #${foundById.id}`} onClose={() => setFoundById(null)}>
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
                {foundById.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Estoque</dt>
              <dd className={`font-medium ${foundById.qtd_estoque < 5 ? "text-amber-400" : "text-zinc-100"}`}>
                {foundById.qtd_estoque} unidades
              </dd>
            </div>
            <div className="col-span-2 border-t border-zinc-700 pt-3">
              <dt className="text-zinc-400 mb-1">Descrição</dt>
              <dd className="text-zinc-200">{foundById.descricao || "Sem descrição"}</dd>
            </div>
            <div>
              <dt className="text-zinc-400 mb-1">Fabricado no Seridó</dt>
              <dd className="text-zinc-100">{foundById.fabricado_em_serido ? "Sim" : "Não"}</dd>
            </div>
          </dl>
          <div className="flex gap-2 border-t border-zinc-700 pt-4">
            <button onClick={() => { setFoundById(null); openEdit(foundById); }} className="bg-amber-700 text-amber-100 px-3 py-2 rounded text-sm hover:bg-amber-600">
              Editar
            </button>
            <button onClick={handleDeleteFoundById} className="bg-red-800 text-red-200 px-3 py-2 rounded text-sm hover:bg-red-700">
              Excluir
            </button>
            <Link href={`/instrumentos/${foundById.id}`} className="bg-zinc-700 text-zinc-200 px-3 py-2 rounded text-sm hover:bg-zinc-600">
              Ver página completa
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
