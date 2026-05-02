"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Phone, Star, Trophy, User } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Historico = {
  tipo: string;
  pontos: number;
  data: string;
};

type Paciente = {
  id: string;
  nome: string;
  telefone: string;
  cpf?: string;
  pontos: number;
  nivel: string;
  status: string;
  historico?: Historico[];
};

export default function PacienteDetalhesPage() {
  const params = useParams();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarPaciente();
  }, [params.id]);

  async function buscarPaciente() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      setPaciente(null);
    } else {
      setPaciente(data);
    }

    setCarregando(false);
  }

  function proximoNivel(pontos: number) {
    if (pontos < 1000) return { nome: "Prata", meta: 1000 };
    if (pontos < 2500) return { nome: "Ouro", meta: 2500 };
    if (pontos < 5000) return { nome: "Platina", meta: 5000 };
    if (pontos < 8000) return { nome: "Diamante", meta: 8000 };
    return { nome: "Máximo", meta: pontos };
  }

  function corNivel(nivel: string) {
    if (nivel === "Diamante") return "bg-blue-100 text-blue-700";
    if (nivel === "Platina") return "bg-slate-100 text-slate-700";
    if (nivel === "Ouro") return "bg-yellow-100 text-yellow-700";
    if (nivel === "Prata") return "bg-gray-100 text-gray-700";
    return "bg-[#eaf3e5] text-[#4c9a2a]";
  }

  const totalHistorico = useMemo(() => {
    return (
      paciente?.historico?.reduce((total, item) => total + item.pontos, 0) || 0
    );
  }, [paciente]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#f3f7fb] p-8 text-[#071d3a]">
        <p className="font-bold">Carregando paciente...</p>
      </main>
    );
  }

  if (!paciente) {
    return (
      <main className="min-h-screen bg-[#f3f7fb] p-8 text-[#071d3a]">
        <p className="font-bold">Paciente não encontrado.</p>

        <Link href="/pacientes">
          <button className="mt-4 bg-[#174f8c] text-white px-5 py-3 rounded-2xl font-bold">
            Voltar
          </button>
        </Link>
      </main>
    );
  }

  const proximo = proximoNivel(paciente.pontos);
  const progresso =
    proximo.nome === "Máximo"
      ? 100
      : Math.min(Math.round((paciente.pontos / proximo.meta) * 100), 100);

  const faltam =
    proximo.nome === "Máximo" ? 0 : Math.max(proximo.meta - paciente.pontos, 0);

  const historicoInvertido = [...(paciente.historico || [])].reverse();

  return (
    <main className="min-h-screen bg-[#f3f7fb] p-8 text-[#071d3a]">
      <Link href="/pacientes">
        <button className="mb-6 flex items-center gap-2 bg-white px-5 py-3 rounded-2xl font-bold shadow hover:-translate-y-0.5 transition">
          <ArrowLeft size={18} />
          Voltar para pacientes
        </button>
      </Link>

      <section className="bg-gradient-to-r from-[#174f8c] to-[#4c9a2a] rounded-3xl shadow p-8 mb-6 text-white overflow-hidden relative">
        <div className="absolute right-8 top-8 text-white/15">
          <Trophy size={140} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mb-4">
                <User size={34} />
              </div>

              <h1 className="text-4xl lg:text-5xl font-black">
                {paciente.nome}
              </h1>

              <div className="flex flex-wrap gap-4 mt-3 text-white/85">
                <span className="flex items-center gap-2">
                  <Phone size={18} />
                  {paciente.telefone}
                </span>

                {paciente.cpf && (
                  <span className="flex items-center gap-2">
                    CPF: {paciente.cpf}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white/20 rounded-3xl p-5 min-w-56">
              <p className="text-white/80">Nível atual</p>
              <h2 className="text-4xl font-black">{paciente.nivel}</h2>
              <p className="text-sm text-white/80 mt-1">{paciente.status}</p>
            </div>
          </div>

          <div className="mt-8 bg-white/15 rounded-3xl p-5">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span>
                {proximo.nome === "Máximo"
                  ? "Paciente no nível máximo"
                  : `Faltam ${faltam.toLocaleString("pt-BR")} pts para ${
                      proximo.nome
                    }`}
              </span>
              <span>{progresso}%</span>
            </div>

            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <CardInfo
          label="Pontos atuais"
          value={`${paciente.pontos.toLocaleString("pt-BR")} pts`}
          icon={<Star className="text-[#4c9a2a]" />}
        />

        <CardInfo
          label="Total já acumulado"
          value={`${totalHistorico.toLocaleString("pt-BR")} pts`}
          icon={<Trophy className="text-[#4c9a2a]" />}
        />

        <CardInfo
          label="Movimentações"
          value={`${paciente.historico?.length || 0}`}
          icon={<Calendar className="text-[#4c9a2a]" />}
        />
      </section>

      <section className="bg-white rounded-3xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black">Histórico de pontos</h2>
            <p className="text-gray-500 text-sm">
              Linha do tempo das movimentações do paciente.
            </p>
          </div>

          <span
            className={`${corNivel(
              paciente.nivel
            )} px-4 py-2 rounded-full font-bold text-sm`}
          >
            {paciente.nivel}
          </span>
        </div>

        {historicoInvertido.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Esse paciente ainda não possui movimentações.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historicoInvertido.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 bg-[#f3f7fb] rounded-2xl p-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow flex items-center justify-center">
                  <Star size={22} className="text-[#4c9a2a]" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="font-black">{item.tipo}</h3>
                      <p className="text-sm text-gray-500">{item.data}</p>
                    </div>

                    <p className="text-[#4c9a2a] font-black">
                      +{item.pontos.toLocaleString("pt-BR")} pts
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CardInfo({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500">{label}</p>
          <h2 className="text-3xl font-black mt-3">{value}</h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}