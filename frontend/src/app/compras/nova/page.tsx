"use client";

import { useEffect, useState } from "react";
import { Cliente, FormaPagamento, Instrumento, Vendedor } from "@/types";
import {
  CompraPayload,
  filtrarInstrumentos,
  getClienteByCpf,
  getFormasPagamento,
  getVendedores,
  realizarCompra,
} from "@/lib/api";

interface ItemCarrinho {
  instrumento: Instrumento;
  qtd: number;
}

function calcularDesconto(cliente: Cliente): number {
  let desconto = 0;
  if (cliente.torce_flamengo) desconto += 0.05;
  if (cliente.assiste_op) desconto += 0.05;
  if (cliente.cidade.toLowerCase() === "sousa") desconto += 0.05;
  return desconto;
}

export default function NovaCompraPage() {
  // dados de apoio
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);

  // cliente
  const [cpfInput, setCpfInput] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [clienteErro, setClienteErro] = useState("");

  // busca de instrumentos
  const [buscaInstrumento, setBuscaInstrumento] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<Instrumento[]>([]);
  const [buscando, setBuscando] = useState(false);

  // carrinho
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  // finalização
  const [idVendedor, setIdVendedor] = useState<number | "">("");
  const [idForma, setIdForma] = useState<number | "">("");

  // status
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<number | null>(null);
  const [erroCompra, setErroCompra] = useState("");

  useEffect(() => {
    Promise.all([getVendedores(), getFormasPagamento()]).then(([v, f]) => {
      setVendedores(v);
      setFormas(f);
    });
  }, []);

  async function handleBuscarCliente() {
    if (!cpfInput.trim()) return;
    setClienteErro("");
    setCliente(null);
    try {
      const c = await getClienteByCpf(cpfInput.trim());
      setCliente(c);
    } catch {
      setClienteErro("Cliente não encontrado. Cadastre-o primeiro em Clientes.");
    }
  }

  async function handleBuscarInstrumento() {
    if (!buscaInstrumento.trim()) return;
    setBuscando(true);
    try {
      const data = await filtrarInstrumentos({ nome: buscaInstrumento });
      setResultadosBusca(data.filter((i) => i.qtd_estoque > 0));
    } finally {
      setBuscando(false);
    }
  }

  function adicionarAoCarrinho(inst: Instrumento) {
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.instrumento.id === inst.id);
      if (existe) {
        return prev.map((i) =>
          i.instrumento.id === inst.id ? { ...i, qtd: i.qtd + 1 } : i
        );
      }
      return [...prev, { instrumento: inst, qtd: 1 }];
    });
    setResultadosBusca([]);
    setBuscaInstrumento("");
  }

  function alterarQtd(id: number, delta: number) {
    setCarrinho((prev) =>
      prev
        .map((i) =>
          i.instrumento.id === id ? { ...i, qtd: i.qtd + delta } : i
        )
        .filter((i) => i.qtd > 0)
    );
  }

  function removerDoCarrinho(id: number) {
    setCarrinho((prev) => prev.filter((i) => i.instrumento.id !== id));
  }

  const subtotal = carrinho.reduce(
    (acc, i) => acc + i.instrumento.preco * i.qtd,
    0
  );
  const desconto = cliente ? calcularDesconto(cliente) : 0;
  const total = subtotal * (1 - desconto);

  async function handleConfirmar() {
    if (!cliente || !idVendedor || !idForma || carrinho.length === 0) return;
    setEnviando(true);
    setErroCompra("");
    try {
      const payload: CompraPayload = {
        id_cliente: cliente.id,
        id_vendedor: Number(idVendedor),
        id_forma_pagamento: Number(idForma),
        itens: carrinho.map((i) => ({
          id_instrumento: i.instrumento.id,
          qtd_item: i.qtd,
        })),
      };
      const res = await realizarCompra(payload);
      setSucesso(res.id_compra);
      setCarrinho([]);
      setCliente(null);
      setCpfInput("");
      setIdVendedor("");
      setIdForma("");
    } catch (e: unknown) {
      setErroCompra(e instanceof Error ? e.message : "Erro ao realizar compra.");
    } finally {
      setEnviando(false);
    }
  }

  const podeConfirmar =
    !!cliente && !!idVendedor && !!idForma && carrinho.length > 0;

  const inputCls =
    "bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500";
  const labelCls = "block text-xs text-zinc-400 mb-1";

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">Nova Compra</h2>

      {/* ── Sucesso ── */}
      {sucesso && (
        <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-4 rounded mb-6">
          <p className="font-medium">Compra #{sucesso} realizada com sucesso!</p>
          <button
            onClick={() => setSucesso(null)}
            className="text-sm underline mt-1 text-green-400 hover:text-green-200"
          >
            Registrar outra compra
          </button>
        </div>
      )}

      {!sucesso && (
        <div className="space-y-6">

          {/* ── 1. Identificação do cliente ── */}
          <section className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              1. Cliente
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="CPF do cliente (ex: 111.222.333-44)"
                value={cpfInput}
                onChange={(e) => { setCpfInput(e.target.value); setClienteErro(""); setCliente(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleBuscarCliente()}
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={handleBuscarCliente}
                className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600"
              >
                Buscar
              </button>
            </div>

            {clienteErro && (
              <p className="text-red-400 text-sm">{clienteErro}</p>
            )}

            {cliente && (
              <div className="bg-zinc-700/50 rounded p-3 text-sm">
                <p className="text-zinc-100 font-medium">{cliente.nome}</p>
                <p className="text-zinc-400">{cliente.email} · {cliente.cidade}/{cliente.estado}</p>
                {desconto > 0 && (
                  <p className="text-green-400 mt-1">
                    Desconto aplicável: {(desconto * 100).toFixed(0)}%
                    {cliente.torce_flamengo && " · Flamengo"}
                    {cliente.assiste_op && " · One Piece"}
                    {cliente.cidade.toLowerCase() === "sousa" && " · Sousa"}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ── 2. Carrinho ── */}
          <section className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              2. Itens
            </h3>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Buscar instrumento pelo nome..."
                value={buscaInstrumento}
                onChange={(e) => setBuscaInstrumento(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscarInstrumento()}
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={handleBuscarInstrumento}
                disabled={buscando}
                className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm hover:bg-zinc-600 disabled:opacity-50"
              >
                {buscando ? "..." : "Buscar"}
              </button>
            </div>

            {/* Resultados da busca */}
            {resultadosBusca.length > 0 && (
              <div className="border border-zinc-600 rounded mb-4 overflow-hidden">
                {resultadosBusca.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-zinc-700 border-b border-zinc-700 last:border-0"
                  >
                    <div>
                      <span className="text-zinc-100 text-sm">{inst.nome}</span>
                      <span className="text-zinc-500 text-xs ml-2">
                        {inst.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        · estoque: {inst.qtd_estoque}
                      </span>
                    </div>
                    <button
                      onClick={() => adicionarAoCarrinho(inst)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500"
                    >
                      + Adicionar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Carrinho vazio */}
            {carrinho.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhum item adicionado.</p>
            ) : (
              <div className="space-y-2">
                {carrinho.map((item) => (
                  <div
                    key={item.instrumento.id}
                    className="flex items-center justify-between bg-zinc-700/50 rounded px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-100 text-sm font-medium truncate">{item.instrumento.nome}</p>
                      <p className="text-zinc-400 text-xs">
                        {item.instrumento.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} × {item.qtd}
                        {" = "}
                        <span className="text-zinc-200">
                          {(item.instrumento.preco * item.qtd).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => alterarQtd(item.instrumento.id, -1)}
                        className="bg-zinc-600 text-zinc-100 w-6 h-6 rounded text-sm hover:bg-zinc-500 flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-zinc-100 text-sm w-4 text-center">{item.qtd}</span>
                      <button
                        onClick={() => alterarQtd(item.instrumento.id, +1)}
                        disabled={item.qtd >= item.instrumento.qtd_estoque}
                        className="bg-zinc-600 text-zinc-100 w-6 h-6 rounded text-sm hover:bg-zinc-500 flex items-center justify-center disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removerDoCarrinho(item.instrumento.id)}
                        className="text-red-400 hover:text-red-300 text-xs ml-1"
                      >
                        remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── 3. Finalização ── */}
          <section className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
              3. Finalização
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelCls}>Vendedor *</label>
                <select
                  value={idVendedor}
                  onChange={(e) => setIdVendedor(e.target.value ? Number(e.target.value) : "")}
                  className={`${inputCls} w-full`}
                >
                  <option value="">Selecionar vendedor...</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Forma de Pagamento *</label>
                <select
                  value={idForma}
                  onChange={(e) => setIdForma(e.target.value ? Number(e.target.value) : "")}
                  className={`${inputCls} w-full`}
                >
                  <option value="">Selecionar forma...</option>
                  {formas.map((f) => (
                    <option key={f.id} value={f.id}>{f.descricao}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumo de valores */}
            {carrinho.length > 0 && (
              <div className="bg-zinc-700/50 rounded p-4 mb-4 text-sm space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Desconto ({(desconto * 100).toFixed(0)}%)</span>
                    <span>− {(subtotal * desconto).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-100 font-semibold pt-1 border-t border-zinc-600">
                  <span>Total</span>
                  <span>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              </div>
            )}

            {erroCompra && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 px-3 py-2 rounded text-sm mb-4">
                {erroCompra}
              </div>
            )}

            <button
              onClick={handleConfirmar}
              disabled={!podeConfirmar || enviando}
              className="w-full bg-green-700 text-white py-3 rounded font-medium hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {enviando ? "Processando..." : "Confirmar Compra"}
            </button>

            {!podeConfirmar && !enviando && (
              <p className="text-zinc-500 text-xs text-center mt-2">
                {!cliente && "Busque um cliente · "}
                {carrinho.length === 0 && "Adicione itens · "}
                {!idVendedor && "Selecione um vendedor · "}
                {!idForma && "Selecione a forma de pagamento"}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
