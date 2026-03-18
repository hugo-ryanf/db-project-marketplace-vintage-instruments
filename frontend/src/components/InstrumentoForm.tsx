"use client";

import { useState } from "react";
import { Instrumento, InstrumentoPayload } from "@/types";
import { createInstrumento, updateInstrumento } from "@/lib/api";

interface Props {
  instrumento?: Instrumento;
  onSave: () => void;
  onCancel: () => void;
}

export default function InstrumentoForm({ instrumento, onSave, onCancel }: Props) {
  const [form, setForm] = useState<InstrumentoPayload>({
    nome: instrumento?.nome ?? "",
    descricao: instrumento?.descricao ?? "",
    preco: instrumento?.preco ?? 0,
    ano_fabricacao: instrumento?.ano_fabricacao ?? new Date().getFullYear(),
    categoria: instrumento?.categoria ?? "",
    marca: instrumento?.marca ?? "",
    qtd_estoque: instrumento?.qtd_estoque ?? 0,
    fabricado_em_serido: instrumento?.fabricado_em_serido ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (instrumento?.id) {
        await updateInstrumento(instrumento.id, form);
      } else {
        await createInstrumento(form);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-zinc-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Nome *</label>
        <input
          className={inputClass}
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Descrição</label>
        <textarea
          className={inputClass}
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Preço (R$) *</label>
          <input
            className={inputClass}
            type="number"
            name="preco"
            value={form.preco}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Ano de Fabricação *</label>
          <input
            className={inputClass}
            type="number"
            name="ano_fabricacao"
            value={form.ano_fabricacao}
            onChange={handleChange}
            min="1800"
            max={new Date().getFullYear()}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Categoria *</label>
          <input
            className={inputClass}
            type="text"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Marca *</label>
          <input
            className={inputClass}
            type="text"
            name="marca"
            value={form.marca}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Quantidade em Estoque</label>
        <input
          className={inputClass}
          type="number"
          name="qtd_estoque"
          value={form.qtd_estoque}
          onChange={handleChange}
          min="0"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          name="fabricado_em_serido"
          id="fabricado_em_serido"
          checked={form.fabricado_em_serido}
          onChange={handleChange}
          className="w-4 h-4 accent-blue-500"
        />
        <label htmlFor="fabricado_em_serido" className="text-sm text-zinc-300">
          Fabricado em série
        </label>
      </div>

      <div className="flex gap-2 pt-2 border-t border-zinc-700">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : instrumento ? "Salvar Alterações" : "Cadastrar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
