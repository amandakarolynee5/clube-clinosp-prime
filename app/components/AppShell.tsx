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

      <main
        className="
          w-full
          min-h-screen
          lg:ml-[240px]
          xl:ml-[260px]
          2xl:ml-[280px]
        "
      >
        {children}
      </main>
    </div>
  );
}