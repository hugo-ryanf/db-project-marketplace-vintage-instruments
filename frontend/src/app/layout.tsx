import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Marketplace Vintage Instruments",
  description: "Projeto BD I — Marketplace de instrumentos musicais antigos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
