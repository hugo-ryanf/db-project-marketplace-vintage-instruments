import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-zinc-900 border-b border-zinc-700">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold text-zinc-100 tracking-tight">
          🎸 Marketplace Vintage Instruments
        </Link>
        <nav className="flex gap-8 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-100">
            Início
          </Link>
          <Link href="/instrumentos" className="hover:text-zinc-100">
            Instrumentos
          </Link>
          <Link href="/clientes" className="hover:text-zinc-100">
            Clientes
          </Link>
        </nav>
      </div>
    </header>
  );
}
