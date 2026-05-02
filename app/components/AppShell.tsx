"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const paginasSemSidebar = ["/login", "/clube", "/acesso-negado"];

  const esconderSidebar = paginasSemSidebar.some((rota) =>
    pathname.startsWith(rota)
  );

  if (esconderSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="lg:ml-80 w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}