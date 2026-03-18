import Link from "next/link";

export default function Home() {
  return (
    <div className="py-12 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-zinc-100 mb-3">
        Marketplace Vintage Instruments
      </h2>
      <p className="text-zinc-400 mb-10 leading-relaxed">
        Sistema de gerenciamento de instrumentos musicais antigos e clientes.
        Projeto da disciplina de Banco de Dados I.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link
          href="/instrumentos"
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 px-6 py-6 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 text-center block"
        >
          <div className="text-3xl mb-3">🎸</div>
          <div className="font-semibold mb-1">Instrumentos</div>
          <div className="text-sm text-zinc-400">Ver catálogo completo</div>
        </Link>

        <Link
          href="/clientes"
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 px-6 py-6 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 text-center block"
        >
          <div className="text-3xl mb-3">👤</div>
          <div className="font-semibold mb-1">Clientes</div>
          <div className="text-sm text-zinc-400">Gerenciar clientes</div>
        </Link>
      </div>

      <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400">
        <strong className="text-zinc-300">Equipe:</strong> Projeto BD I — UFRJ / 2025
        <br />
        <strong className="text-zinc-300">Backend:</strong> FastAPI + PostgreSQL em{" "}
        <code className="bg-zinc-700 px-1 py-0.5 rounded text-zinc-300">
          http://localhost:8000
        </code>
      </div>
    </div>
  );
}
