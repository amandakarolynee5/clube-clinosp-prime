"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  Gift,
  Star,
} from "lucide-react";

const LOGO = "/logo-clinosp.png";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) router.push("/");
    }

    verificarSessao();
  }, [router]);

  async function fazerLogin() {
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha email e senha.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha.trim(),
    });

    setLoading(false);

    if (error) {
      setErro("Email ou senha incorretos. Verifique e tente novamente.");
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#eef4fa] px-6 py-8 text-[#071d3a]">
      <section className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white">
        
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#071d3a] via-[#174f8c] to-[#4c9a2a] text-white p-10 min-h-[580px]">
          <div>
            <Image
              src={LOGO}
              alt="Clinosp Prime"
              width={210}
              height={90}
              className="w-auto h-auto mb-8"
            />

            <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold">
              <Sparkles size={16} />
              Clinosp Prime
            </span>

            <h1 className="text-4xl font-black leading-tight mt-7">
              Clube de Fidelização Premium
            </h1>

            <p className="text-white/85 mt-5 leading-7 max-w-md">
              Gerencie pacientes, pontos, brindes e resgates em uma experiência
              moderna e organizada.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <MiniCard icon={<ShieldCheck size={18} />} title="Seguro" />
            <MiniCard icon={<Gift size={18} />} title="Brindes" />
            <MiniCard icon={<Star size={18} />} title="Pontos" />
          </div>

          <p className="text-sm text-white/70 mt-8">
            © Clinosp Prime • Sistema interno
          </p>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 min-h-[580px]">
          <div className="flex justify-center mb-8">
            <Image
              src={LOGO}
              alt="Clinosp Prime"
              width={210}
              height={90}
              className="w-auto h-auto"
            />
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#eaf3e5] flex items-center justify-center mb-6">
            <Lock className="text-[#4c9a2a]" size={27} />
          </div>

          <h2 className="text-4xl font-black text-[#071d3a]">
            Acessar sistema
          </h2>

          <p className="text-gray-500 mt-3 leading-6">
            Entre com suas credenciais para acessar o painel do Clube Clinosp
            Prime.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="font-bold text-sm">Email</label>

              <div className="mt-2 flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-4 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#174f8c]/20">
                <Mail size={18} className="text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-sm">Senha</label>

              <div className="mt-2 flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-4 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#174f8c]/20">
                <Lock size={18} className="text-gray-400" />

                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full outline-none bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="text-gray-400 hover:text-[#174f8c]"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold">
                {erro}
              </div>
            )}

            <button
              onClick={fazerLogin}
              disabled={loading}
              className="w-full bg-[#174f8c] hover:bg-[#123d6e] text-white py-4 rounded-2xl font-black shadow-lg transition disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar no sistema"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Beneficio texto="Acesso seguro" />
            <Beneficio texto="Gestão premium" />
            <Beneficio texto="Tempo real" />
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 p-4">
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-bold">{title}</p>
    </div>
  );
}

function Beneficio({ texto }: { texto: string }) {
  return (
    <div className="flex min-h-[48px] items-center justify-center rounded-2xl bg-[#f7fafc] px-3 text-center text-xs font-bold text-[#174f8c]">
      {texto}
    </div>
  );
}