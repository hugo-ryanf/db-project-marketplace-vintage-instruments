"use client";

import { useState } from "react";
import { Cliente, Compra } from "@/types";
import { getClienteByCpf, getComprasDoCliente } from "@/lib/api";

const MESES = [
  "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatarData(data: string) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function badgeStatus(status: string) {
  const map: Record<string, string> = {
    confirmada: "bg-green-900/50 text-green-300 border-green-700",
    pendente:   "bg-amber-900/50 text-amber-300 border-amber-700",
    cancelada:  "bg-red-900/50 text-red-300 border-red-700",
  };
  return map[status] ?? "bg-zinc-700 text-zinc-300 border-zinc-600";
}

export default function MinhaContaPage() {
  const [cpfInput, setCpfInput] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [compraAberta, setCompraAberta] = useState<number | null>(null);

  async function handleBuscar() {
    if (!cpfInput.trim()) return;
    setLoading(true);
    setErro("");
    setCliente(null);
    setCompras([]);
    try {
      const c = await getClienteByCpf(cpfInput.trim());
      const pedidos = await getComprasDoCliente(c.id);
      setCliente(c);
      setCompras(pedidos);
    } catch {
      setErro("Cliente não encontrado. Verifique o CPF digitado.");
    } finally {
      setLoading(false);
    }
  }

  const brl = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-zinc-100 mb-2">Minha Conta</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Digite seu CPF para consultar seus dados e pedidos.
      </p>

      {/* Busca por CPF */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="CPF (ex: 111.222.333-44)"
          value={cpfInput}
          onChange={(e) => { setCpfInput(e.target.value); setErro(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 flex-1 focus:outline-none focus:border-zinc-500"
        />
        <button
          onClick={handleBuscar}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {erro && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded text-sm mb-6">
          {erro}
        </div>
      )}

      {cliente && (
        <>
          {/* ── Dados do cliente ── */}
          <section className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5 mb-6">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              Dados cadastrais
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 text-xs mb-0.5">Nome</dt>
                <dd className="text-zinc-100 font-medium">{cliente.nome}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs mb-0.5">CPF</dt>
                <dd className="text-zinc-100 font-mono">{cliente.cpf}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs mb-0.5">E-mail</dt>
                <dd className="text-zinc-100">{cliente.email}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs mb-0.5">Telefone</dt>
                <dd className="text-zinc-100">{cliente.telefone}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-zinc-500 text-xs mb-0.5">Endereço</dt>
                <dd className="text-zinc-100">
                  {cliente.endereco} — {cliente.cidade}/{cliente.estado}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs mb-0.5">Torce pelo Flamengo</dt>
                <dd className={cliente.torce_flamengo ? "text-red-400" : "text-zinc-400"}>
                  {cliente.torce_flamengo ? "Sim 🔴⚫" : "Não"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs mb-0.5">Assiste One Piece</dt>
                <dd className={cliente.assiste_op ? "text-amber-400" : "text-zinc-400"}>
                  {cliente.assiste_op ? "Sim ⚓" : "Não"}
                </dd>
              </div>
            </dl>
          </section>

          {/* ── Pedidos ── */}
          <section>
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              Pedidos ({compras.length})
            </h3>

            {compras.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhuma compra realizada ainda.</p>
            ) : (
              <div className="space-y-3">
                {compras.map((compra) => (
                  <div key={compra.id} className="border border-zinc-700 rounded-lg overflow-hidden">
                    {/* Cabeçalho do pedido */}
                    <button
                      onClick={() =>
                        setCompraAberta(compraAberta === compra.id ? null : compra.id)
                      }
                      className="w-full flex items-center justify-between px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-500 text-xs font-mono">#{compra.id}</span>
                        <span className="text-zinc-100 text-sm font-medium">
                          {formatarData(compra.data_compra)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${badgeStatus(compra.status_compra)}`}>
                          {compra.status_compra}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-100 text-sm font-semibold">
                          {brl(compra.valor_total)}
                        </span>
                        <span className="text-zinc-500 text-xs">
                          {compraAberta === compra.id ? "▲" : "▼"}
                        </span>
                      </div>
                    </button>

                    {/* Detalhe do pedido */}
                    {compraAberta === compra.id && (
                      <div className="px-5 py-4 bg-zinc-900 text-sm space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-xs text-zinc-400">
                          <div>
                            <span className="block text-zinc-500 mb-0.5">Vendedor</span>
                            {compra.vendedor}
                          </div>
                          <div>
                            <span className="block text-zinc-500 mb-0.5">Pagamento</span>
                            {compra.forma_pagamento ?? "—"}
                          </div>
                          <div>
                            <span className="block text-zinc-500 mb-0.5">Status pagamento</span>
                            <span className={compra.status_pagamento === "confirmado" ? "text-green-400" : "text-amber-400"}>
                              {compra.status_pagamento ?? "—"}
                            </span>
                          </div>
                        </div>

                        {compra.desconto_aplicado > 0 && (
                          <p className="text-green-400 text-xs">
                            Desconto aplicado: {(compra.desconto_aplicado * 100).toFixed(0)}%
                          </p>
                        )}

                        {/* Itens */}
                        <div className="border-t border-zinc-700 pt-3">
                          <p className="text-zinc-400 text-xs mb-2">Itens</p>
                          <div className="space-y-1">
                            {(compra.itens ?? []).map((item, i) => (
                              <div key={i} className="flex justify-between text-zinc-300 text-xs">
                                <span>{item.nome} × {item.qtd_item}</span>
                                <span>
                                  {(item.preco_unitario * item.qtd_item).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
