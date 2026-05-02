"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Gift,
  Repeat,
  History,
  BarChart3,
  Settings,
  Star,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type TipoUsuario = "admin" | "atendente" | "paciente";

type Perfil = {
  nome: string;
  tipo: TipoUsuario;
  email: string;
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", user.id)
      .single();

    setPerfil({
      nome: data?.nome || "Usuário",
      tipo: (data?.tipo || "atendente") as TipoUsuario,
      email: user.email || "",
    });
  }

  async function sair() {
    const confirmar = confirm("Deseja sair do sistema?");
    if (!confirmar) return;

    await supabase.auth.signOut();
    router.push("/login");
  }

  const todosMenus = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      permissoes: ["admin", "atendente"],
    },
    {
      name: "Pacientes",
      icon: Users,
      href: "/pacientes",
      permissoes: ["admin", "atendente"],
    },
    {
      name: "Ranking",
      icon: Trophy,
      href: "/ranking",
      permissoes: ["admin", "atendente"],
    },
    {
      name: "Brindes",
      icon: Gift,
      href: "/brindes",
      permissoes: ["admin"],
    },
    {
      name: "Resgates",
      icon: Repeat,
      href: "/resgates",
      permissoes: ["admin", "atendente", "paciente"],
    },
    {
      name: "Histórico",
      icon: History,
      href: "/historico",
      permissoes: ["admin", "atendente"],
    },
    {
      name: "Relatórios",
      icon: BarChart3,
      href: "/relatorios",
      permissoes: ["admin", "atendente"],
    },
    {
      name: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      permissoes: ["admin"],
    },
  ];

  const tipoUsuario = perfil?.tipo || "atendente";

  const menuItems = todosMenus.filter((item) =>
    item.permissoes.includes(tipoUsuario)
  );

  return (
    <aside className="w-80 min-h-screen bg-[#174f8c] text-white p-6 hidden lg:flex flex-col justify-between fixed left-0 top-0">
      
      {/* TOPO */}
      <div>
        <div className="mb-10 flex justify-center">
          <Image
            src="/logo-clinosp.png"
            alt="Clinosp Prime"
            width={280}
            height={150}
            priority
            className="object-contain w-full max-w-[240px]"
          />
        </div>

        {/* MENU */}
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const ativo =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link href={item.href} key={item.name}>
                <div
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold cursor-pointer transition-all duration-300 ${
                    ativo
                      ? "bg-white text-[#174f8c] shadow"
                      : "text-white/90 hover:bg-white/15 hover:translate-x-1"
                  }`}
                >
                  <Icon size={22} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* PARTE DE BAIXO */}
      <div className="space-y-4">

        {/* CARD */}
        <div className="rounded-3xl p-5 bg-white/15 border border-white/20">
          <Star className="text-[#9ac84b] mb-3" />
          <h3 className="font-bold text-lg">Clube Clinosp Prime</h3>
          <p className="text-sm text-white/80 mt-2">
            Fidelizar é transformar sorrisos em experiências.
          </p>
        </div>

        {/* LOGOUT */}
        <button
          onClick={sair}
          className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 py-3 rounded-2xl font-bold transition-all shadow-lg"
        >
          <LogOut size={18} />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}