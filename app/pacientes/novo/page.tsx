"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Phone, BadgeCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function NovoPacientePage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function salvarPaciente() {
    if (!nome.trim() || !telefone.trim()) {
      alert("Preencha pelo menos nome e telefone.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.from("pacientes").insert([
      {
        nome: nome.trim(),
        telefone: telefone.trim(),
        cpf: cpf.trim() || null,
        pontos: 0,
        nivel: "Bronze",
        status: "Ativo",
        historico: [],
      },
    ]);

    setCarregando(false);

    if (error) {
      console.error(error);
      alert("Erro ao cadastrar paciente.");
      return;
    }

    router.push("/pacientes");
  }

  return (
    <main className="min-h-screen bg-[#f3f7fb] p-8 text-[#071d3a]">
      <section className="mb-8">
        <Link href="/pacientes">
          <button className="mb-6 flex items-center gap-2 text-[#174f8c] font-bold">
            <ArrowLeft size={20} />
            Voltar para pacientes
          </button>
        </Link>

        <h1 className="text-4xl font-black">Novo Paciente</h1>
        <p className="text-gray-500 mt-2">
          Cadastre um novo paciente no Clube Clinosp Prime.
        </p>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <UserPlus className="text-[#4c9a2a]" />
            Dados do paciente
          </h2>

          <div className="space-y-5">
            <Campo
              label="Nome completo"
              placeholder="Ex: Amanda Karoline"
              value={nome}
              onChange={setNome}
              icon={<UserPlus size={20} />}
            />

            <Campo
              label="Telefone"
              placeholder="Ex: (94) 99999-0000"
              value={telefone}
              onChange={setTelefone}
              icon={<Phone size={20} />}
            />

            <Campo
              label="CPF"
              placeholder="Digite o CPF do paciente"
              value={cpf}
              onChange={setCpf}
              icon={<BadgeCheck size={20} />}
            />

            <button
              onClick={salvarPaciente}
              disabled={carregando}
              className="w-full bg-[#174f8c] hover:bg-[#123d6e] disabled:opacity-60 text-white py-4 rounded-2xl font-black shadow transition"
            >
              {carregando ? "Salvando..." : "Salvar paciente"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <div className="w-16 h-16 rounded-2xl bg-[#eaf3e5] flex items-center justify-center text-3xl mb-5">
            🏆
          </div>

          <h2 className="text-2xl font-black">Entrada no Clube</h2>

          <p className="text-gray-500 mt-3">
            Todo novo paciente começa no nível Bronze com 0 pontos.
          </p>

          <div className="mt-6 space-y-4">
            <Info label="Nível inicial" value="Bronze" />
            <Info label="Pontos iniciais" value="0 pts" />
            <Info label="Status" value="Ativo" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Campo({
  label,
  placeholder,
  value,
  onChange,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-bold">{label}</label>

      <div className="mt-2 flex items-center gap-3 border rounded-2xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-[#174f8c]/20">
        <span className="text-gray-400">{icon}</span>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none"
        />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-3">
      <span className="text-gray-500">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}