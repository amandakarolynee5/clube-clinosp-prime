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
  Sparkles,
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
    <aside className="w-72 min-h-screen fixed left-0 top-0 hidden lg:flex flex-col justify-between overflow-hidden bg-[#071d3a] text-white shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-[#174f8c] via-[#0d3765] to-[#071d3a]" />

      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#4c9a2a]/25 blur-3xl" />

      <div className="absolute bottom-20 -left-24 w-72 h-72 rounded-full bg-[#9ac84b]/20 blur-3xl" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.13),transparent_35%)]" />

      <div className="relative z-10 p-4 flex flex-col min-h-screen justify-between">
        {/* TOPO */}
        <div>
          <div className="mb-6 flex justify-center">
            <div className="rounded-[2rem] px-4 py-3 bg-white/5 border border-white/10 shadow-inner">
              <Image
                src="/logo-clinosp.png"
                alt="Clinosp Prime"
                width={400}
                height={200}
                priority
                className="object-contain w-[180px] h-auto"
              />
            </div>
          </div>

          {/* MENU */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const ativo =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link href={item.href} key={item.name}>
                  <div
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl font-bold cursor-pointer transition-all duration-300 ${
                      ativo
                        ? "bg-white text-[#174f8c] shadow-xl"
                        : "text-white/85 hover:bg-white/12 hover:translate-x-1"
                    }`}
                  >
                    {ativo && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-[#9ac84b]" />
                    )}

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        ativo
                          ? "bg-[#eef4fa] text-[#174f8c]"
                          : "bg-white/10 text-white group-hover:bg-white/20"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <span className="text-[15px]">{item.name}</span>

                    {ativo && (
                      <Sparkles
                        size={14}
                        className="ml-auto text-[#4c9a2a]"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* PARTE DE BAIXO */}
        <div className="space-y-3 pt-2">
          {/* CARD */}
          <div className="relative overflow-hidden rounded-3xl p-4 bg-white/12 border border-white/20 backdrop-blur-md shadow-xl">
            <div className="absolute -right-10 -top-10 w-28 h-28 bg-[#9ac84b]/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
                <Star className="text-[#9ac84b]" size={18} />
              </div>

              <h3 className="font-black text-base">
                Clube Clinosp Prime
              </h3>

              <p className="text-xs text-white/75 mt-2 leading-5">
                Fidelizar é transformar sorrisos em experiências.
              </p>

              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-[#9ac84b] to-[#4c9a2a]" />
              </div>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            onClick={sair}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#174f8c] to-[#071d3a] hover:from-[#2563a6] hover:to-[#174f8c] py-3 rounded-2xl font-black transition-all duration-300 shadow-lg hover:scale-[1.02]"
          >
            <LogOut size={17} />
            Sair do sistema
          </button>
        </div>
      </div>
    </aside>
  );
}