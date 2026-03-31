"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/instrumentos",  label: "Instrumentos" },
  { href: "/clientes",      label: "Clientes" },
  { href: "/vendedores",    label: "Vendedores" },
  { href: "/compras/nova",  label: "Nova Compra" },
  { href: "/minha-conta",   label: "Minha Conta" },
  { href: "/relatorios",    label: "Relatórios" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-700 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-700">
        <Link href="/" className="block">
          <div className="text-base font-bold text-zinc-100 leading-tight">
            🎸 Vintage
          </div>
          <div className="text-base font-bold text-zinc-100 leading-tight">
            Instruments
          </div>
          <div className="text-xs text-zinc-500 mt-1">Projeto BD I</div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className={
              isActive(href)
                ? "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium bg-zinc-700 text-zinc-100"
                : "flex items-center gap-3 px-3 py-2 rounded text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            }
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
