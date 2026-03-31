"use client";

import { useState } from "react";
import {
  RelatorioClientePorEstado,
  RelatorioInstrumentoPorCategoria,
  RelatorioVendasMensais,
} from "@/types";
import {
  getRelatorioClientesPorEstado,
  getRelatorioInstrumentosPorCategoria,
  getRelatorioVendasMensais,
} from "@/lib/api";

type ActiveReport = "instrumentos" | "clientes" | "vendas" | null;

const MESES = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function RelatoriosPage() {
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [instrumentosData, setInstrumentosData] = useState<RelatorioInstrumentoPorCategoria[]>([]);
  const [clientesData, setClientesData] = useState<RelatorioClientePorEstado[]>([]);
  const [vendasData, setVendasData] = useState<RelatorioVendasMensais[]>([]);

  // filtros do relatório de vendas
  const [anoFiltro, setAnoFiltro] = useState<string>("");
  const [mesFiltro, setMesFiltro] = useState<string>("");

  async function handleToggle(report: "instrumentos" | "clientes") {
    if (activeReport === report) { setActiveReport(null); return; }
    setActiveReport(report);
    if (report === "instrumentos" && instrumentosData.length > 0) return;
    if (report === "clientes" && clientesData.length > 0) return;

    setLoading(true);
    setError("");
    try {
      if (report === "instrumentos") {
        setInstrumentosData(await getRelatorioInstrumentosPorCategoria());
      } else {
        setClientesData(await getRelatorioClientesPorEstado());
      }
    } catch {
      setError("Erro ao carregar relatório. Verifique se o backend está rodando.");
      setActiveReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCarregarVendas() {
    setActiveReport("vendas");
    setLoading(true);
    setError("");
    try {
      const ano = anoFiltro ? parseInt(anoFiltro) : undefined;
      const mes = mesFiltro ? parseInt(mesFiltro) : undefined;
      setVendasData(await getRelatorioVendasMensais(ano, mes));
    } catch {
      setError("Erro ao carregar relatório de vendas.");
      setActiveReport(null);
    } finally {
      setLoading(false);
    }
  }

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-zinc-100 mb-2">Central de Relatórios</h2>
      <p className="text-zinc-400 text-sm mb-8">
        Clique em um relatório para carregar os dados. Clique novamente para fechar.
      </p>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* ── Instrumentos por Categoria ── */}
        <div>
          <button
            onClick={() => handleToggle("instrumentos")}
            className={`w-full text-left px-5 py-4 rounded-lg border text-sm font-medium ${
              activeReport === "instrumentos"
                ? "bg-zinc-700 border-zinc-600 text-zinc-100"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600"
            }`}
          >
            <span className="text-lg mr-2">📦</span>
            Relatório de Instrumentos por Categoria
            <span className="float-right text-zinc-500 font-normal">
              {activeReport === "instrumentos" ? "▲ fechar" : "▼ abrir"}
            </span>
          </button>

          {activeReport === "instrumentos" && (
            <div className="mt-2 rounded-lg border border-zinc-700 overflow-x-auto">
              {loading ? (
                <p className="text-zinc-500 text-sm px-4 py-4">Carregando...</p>
              ) : instrumentosData.length === 0 ? (
                <p className="text-zinc-500 text-sm px-4 py-4">Nenhum dado encontrado.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-800 text-left">
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Categoria</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Qtd. Instrumentos</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Total em Estoque</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Valor Total (R$)</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Preço Médio (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instrumentosData.map((row, i) => (
                      <tr key={row.categoria} className={i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}>
                        <td className="px-4 py-3 text-zinc-100 font-medium">{row.categoria}</td>
                        <td className="px-4 py-3 text-zinc-300 text-center">{row.qtd_instrumentos}</td>
                        <td className="px-4 py-3 text-zinc-300 text-center">{row.total_estoque}</td>
                        <td className="px-4 py-3 text-zinc-200">{brl(row.valor_total)}</td>
                        <td className="px-4 py-3 text-zinc-200">{brl(row.preco_medio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* ── Clientes por Estado ── */}
        <div>
          <button
            onClick={() => handleToggle("clientes")}
            className={`w-full text-left px-5 py-4 rounded-lg border text-sm font-medium ${
              activeReport === "clientes"
                ? "bg-zinc-700 border-zinc-600 text-zinc-100"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600"
            }`}
          >
            <span className="text-lg mr-2">📍</span>
            Relatório de Clientes por Estado
            <span className="float-right text-zinc-500 font-normal">
              {activeReport === "clientes" ? "▲ fechar" : "▼ abrir"}
            </span>
          </button>

          {activeReport === "clientes" && (
            <div className="mt-2 rounded-lg border border-zinc-700 overflow-x-auto">
              {loading ? (
                <p className="text-zinc-500 text-sm px-4 py-4">Carregando...</p>
              ) : clientesData.length === 0 ? (
                <p className="text-zinc-500 text-sm px-4 py-4">Nenhum dado encontrado.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-800 text-left">
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Estado</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Qtd. Clientes</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Torcem Flamengo</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Assistem One Piece</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesData.map((row, i) => (
                      <tr key={row.estado} className={i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}>
                        <td className="px-4 py-3 text-zinc-100 font-medium">{row.estado}</td>
                        <td className="px-4 py-3 text-zinc-300 text-center">{row.qtd_clientes}</td>
                        <td className="px-4 py-3 text-zinc-300 text-center">{row.qtd_flamengo}</td>
                        <td className="px-4 py-3 text-zinc-300 text-center">{row.qtd_one_piece}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* ── Vendas Mensais por Vendedor ── */}
        <div>
          <div
            className={`px-5 py-4 rounded-lg border text-sm font-medium ${
              activeReport === "vendas"
                ? "bg-zinc-700 border-zinc-600"
                : "bg-zinc-800 border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-100">
                <span className="text-lg mr-2">📊</span>
                Relatório Mensal de Vendas por Vendedor
              </span>
              {activeReport === "vendas" && (
                <button
                  onClick={() => setActiveReport(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs font-normal"
                >
                  ▲ fechar
                </button>
              )}
            </div>

            {/* Filtros */}
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Ano</label>
                <input
                  type="number"
                  placeholder="Ex: 2025"
                  value={anoFiltro}
                  onChange={(e) => setAnoFiltro(e.target.value)}
                  className="bg-zinc-900 border border-zinc-600 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 w-28 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Mês</label>
                <select
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(e.target.value)}
                  className="bg-zinc-900 border border-zinc-600 rounded px-3 py-1.5 text-sm text-zinc-100 w-36 focus:outline-none focus:border-zinc-500"
                >
                  <option value="">Todos</option>
                  {MESES.slice(1).map((m, i) => (
                    <option key={i + 1} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCarregarVendas}
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-500"
              >
                Gerar relatório
              </button>
            </div>
          </div>

          {activeReport === "vendas" && (
            <div className="mt-2 rounded-lg border border-zinc-700 overflow-x-auto">
              {loading ? (
                <p className="text-zinc-500 text-sm px-4 py-4">Carregando...</p>
              ) : vendasData.length === 0 ? (
                <p className="text-zinc-500 text-sm px-4 py-4">
                  Nenhuma venda encontrada para o período selecionado.
                </p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-800 text-left">
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Vendedor</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Mês/Ano</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Qtd. Vendas</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Total Vendido</th>
                      <th className="px-4 py-3 border-b border-zinc-700 text-zinc-300 font-semibold">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendasData.map((row, i) => (
                      <tr key={`${row.id_vendedor}-${row.ano}-${row.mes}`} className={i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}>
                        <td className="px-4 py-3 text-zinc-100 font-medium">{row.vendedor}</td>
                        <td className="px-4 py-3 text-zinc-300">{MESES[row.mes]}/{row.ano}</td>
                        <td className="px-4 py-3 text-zinc-300 text-center">{row.qtd_vendas}</td>
                        <td className="px-4 py-3 text-zinc-200 font-medium">{brl(row.total_vendas)}</td>
                        <td className="px-4 py-3 text-zinc-400">{brl(row.ticket_medio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
