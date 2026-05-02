"use client";

import { useRouter } from "next/navigation";
import { ShieldX, ArrowLeft, Sparkles } from "lucide-react";

export default function AcessoNegadoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#eef4fa] flex items-center justify-center p-6">
      <div className="relative max-w-2xl w-full">

        {/* EFEITO DE FUNDO */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#174f8c]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#4c9a2a]/10 rounded-full blur-3xl" />

        {/* CARD */}
        <div className="relative bg-white rounded-[2rem] shadow-2xl p-10 text-center border border-white">

          {/* ÍCONE */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-100 flex items-center justify-center">
            <ShieldX size={36} className="text-red-500" />
          </div>

          {/* BADGE */}
          <span className="inline-flex items-center gap-2 bg-[#eef4fa] text-[#174f8c] px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles size={16} />
            Acesso restrito
          </span>

          {/* TÍTULO */}
          <h1 className="text-3xl md:text-4xl font-black text-[#071d3a]">
            Você não tem permissão
          </h1>

          {/* TEXTO */}
          <p className="text-gray-500 mt-4 max-w-md mx-auto">
            Esta área é restrita do sistema. Caso acredite que isso seja um erro,
            entre em contato com o administrador.
          </p>

          {/* BOTÕES */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-[#174f8c] hover:bg-[#123d6e] text-white px-6 py-3 rounded-2xl font-bold shadow transition"
            >
              Ir para o início
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 border px-6 py-3 rounded-2xl font-bold text-[#174f8c] hover:bg-[#eef4fa] transition"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}