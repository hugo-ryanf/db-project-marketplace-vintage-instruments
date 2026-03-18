"use client";

import { useState } from "react";
import { Cliente, ClientePayload } from "@/types";
import { createCliente, updateCliente } from "@/lib/api";

interface Props {
  cliente?: Cliente;
  onSave: () => void;
  onCancel: () => void;
}

export default function ClienteForm({ cliente, onSave, onCancel }: Props) {
  const [form, setForm] = useState<ClientePayload>({
    nome: cliente?.nome ?? "",
    email: cliente?.email ?? "",
    telefone: cliente?.telefone ?? "",
    cpf: cliente?.cpf ?? "",
    endereco: cliente?.endereco ?? "",
    cidade: cliente?.cidade ?? "",
    estado: cliente?.estado ?? "",
    torce_flamengo: cliente?.torce_flamengo ?? false,
    assiste_op: cliente?.assiste_op ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (cliente?.id) {
        await updateCliente(cliente.id, form);
      } else {
        await createCliente(form);
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Email *</label>
          <input
            className={inputClass}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Telefone *</label>
          <input
            className={inputClass}
            type="text"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            placeholder="(21) 99999-9999"
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>CPF *</label>
        <input
          className={inputClass}
          type="text"
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          placeholder="000.000.000-00"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Endereço *</label>
        <input
          className={inputClass}
          type="text"
          name="endereco"
          value={form.endereco}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Cidade *</label>
          <input
            className={inputClass}
            type="text"
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Estado *</label>
          <input
            className={inputClass}
            type="text"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            placeholder="RJ"
            maxLength={2}
            required
          />
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="torce_flamengo"
            id="torce_flamengo"
            checked={form.torce_flamengo}
            onChange={handleChange}
            className="w-4 h-4 accent-blue-500"
          />
          <label htmlFor="torce_flamengo" className="text-sm text-zinc-300">
            Torce para o Flamengo
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="assiste_op"
            id="assiste_op"
            checked={form.assiste_op}
            onChange={handleChange}
            className="w-4 h-4 accent-blue-500"
          />
          <label htmlFor="assiste_op" className="text-sm text-zinc-300">
            Assiste One Piece
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-zinc-700">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : cliente ? "Salvar Alterações" : "Cadastrar"}
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
