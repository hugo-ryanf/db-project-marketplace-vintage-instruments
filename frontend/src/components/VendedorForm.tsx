"use client";

import { useState } from "react";
import { Vendedor, VendedorPayload } from "@/types";
import { createVendedor, updateVendedor } from "@/lib/api";

interface Props {
  vendedor?: Vendedor;
  onSave: () => void;
  onCancel: () => void;
}

export default function VendedorForm({ vendedor, onSave, onCancel }: Props) {
  const [form, setForm] = useState<VendedorPayload>({
    nome:          vendedor?.nome          ?? "",
    email:         vendedor?.email         ?? "",
    telefone:      vendedor?.telefone      ?? "",
    cpf:           vendedor?.cpf           ?? "",
    data_admissao: vendedor?.data_admissao ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (vendedor) {
        await updateVendedor(vendedor.id, form);
      } else {
        await createVendedor(form);
      }
      onSave();
    } catch {
      setError("Erro ao salvar vendedor. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500";
  const label = "block text-xs text-zinc-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>Nome *</label>
          <input name="nome" value={form.nome} onChange={handle} required className={input} placeholder="Nome completo" />
        </div>

        <div>
          <label className={label}>E-mail *</label>
          <input name="email" type="email" value={form.email} onChange={handle} required className={input} placeholder="email@exemplo.com" />
        </div>

        <div>
          <label className={label}>Telefone</label>
          <input name="telefone" value={form.telefone ?? ""} onChange={handle} className={input} placeholder="(83) 99999-9999" />
        </div>

        <div>
          <label className={label}>CPF *</label>
          <input name="cpf" value={form.cpf} onChange={handle} required className={input} placeholder="000.000.000-00" />
        </div>

        <div>
          <label className={label}>Data de Admissão</label>
          <input name="data_admissao" type="date" value={form.data_admissao ?? ""} onChange={handle} className={input} />
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-zinc-700">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : vendedor ? "Salvar alterações" : "Criar vendedor"}
        </button>
        <button type="button" onClick={onCancel} className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600">
          Cancelar
        </button>
      </div>
    </form>
  );
}
