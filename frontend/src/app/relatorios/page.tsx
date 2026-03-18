"use client";

import { useState } from "react";
import {
  RelatorioClientePorEstado,
  RelatorioInstrumentoPorCategoria,
} from "@/types";
import {
  getRelatorioClientesPorEstado,
  getRelatorioInstrumentosPorCategoria,
} from "@/lib/api";

type ActiveReport = "instrumentos" | "clientes" | null;

export default function RelatoriosPage() {
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [instrumentosData, setInstrumentosData] = useState<RelatorioInstrumentoPorCategoria[]>([]);
  const [clientesData, setClientesData] = useState<RelatorioClientePorEstado[]>([]);

  async function handleToggle(report: "instrumentos" | "clientes") {
    // Toggle off if already active
    if (activeReport === report) {
      setActiveReport(null);
      return;
    }

    setActiveReport(report);

    // Use cached data if already loaded
    if (report === "instrumentos" && instrumentosData.length > 0) return;
    if (report === "clientes" && clientesData.length > 0) return;

    setLoading(true);
    setError("");
    try {
      if (report === "instrumentos") {
        const data = await getRelatorioInstrumentosPorCategoria();
        setInstrumentosData(data);
      } else {
        const data = await getRelatorioClientesPorEstado();
        setClientesData(data);
      }
    } catch {
      setError("Erro ao carregar relatório. Verifique se o backend está rodando.");
      setActiveReport(null);
    } finally {
      setLoading(false);
    }
  }

  const brl = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
        {/* ── Relatório de Instrumentos por Categoria ── */}
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
                      <tr
                        key={row.categoria}
                        className={i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}
                      >
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

        {/* ── Relatório de Clientes por Estado ── */}
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
                      <tr
                        key={row.estado}
                        className={i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}
                      >
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
      </div>
    </div>
  );
}
