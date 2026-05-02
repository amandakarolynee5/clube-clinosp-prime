"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  Medal,
  Trophy,
  Star,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Paciente = {
  id: string;
  nome: string;
  telefone: string;
  cpf?: string;
  pontos: number;
  nivel: string;
  status: string;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarRanking();
  }, []);

  async function carregarRanking() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .order("pontos", { ascending: false });

    if (error) {
      console.error(error);
      setRanking([]);
    } else {
      setRanking((data as Paciente[]) || []);
    }

    setCarregando(false);
  }

  const topPaciente = ranking[0];

  const totalPontos = ranking.reduce(
    (total, paciente) => total + (paciente.pontos || 0),
    0
  );

  const mediaPontos =
    ranking.length > 0 ? Math.round(totalPontos / ranking.length) : 0;

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
        <p className="font-black text-[#174f8c]">Carregando ranking...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-8 lg:p-10 text-white shadow-2xl mb-8">
        <div className="absolute right-[-70px] top-[-70px] w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-[35%] bottom-[-130px] w-96 h-96 rounded-full bg-[#9ac84b]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-5">
              <Sparkles size={16} />
              Ranking premium
            </span>

            <h1 className="text-4xl lg:text-6xl font-black leading-tight">
              Ranking de Pacientes
            </h1>

            <p className="text-white/80 mt-4 text-lg max-w-2xl">
              Acompanhe os pacientes mais engajados no Clube Clinosp Prime.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur rounded-[2rem] p-6 min-w-64">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-300" size={34} />
              <div>
                <p className="text-white/70 text-sm">Paciente destaque</p>
                <h2 className="text-2xl font-black">
                  {topPaciente?.nome || "Sem ranking"}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {ranking.length === 0 ? (
        <section className="bg-white rounded-[2rem] shadow p-10 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-black">Nenhum paciente no ranking</h2>
          <p className="text-gray-500 mt-2">
            Cadastre pacientes e adicione pontos para montar o ranking.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <CardPremium
              titulo="Total de pacientes"
              valor={ranking.length.toString()}
              descricao="Participantes cadastrados"
              icon={<Users size={28} />}
              destaque="azul"
            />

            <CardPremium
              titulo="Maior pontuação"
              valor={`${(topPaciente?.pontos || 0).toLocaleString("pt-BR")} pts`}
              descricao={topPaciente?.nome || "Sem paciente"}
              icon={<Crown size={28} />}
              destaque="verde"
            />

            <CardPremium
              titulo="Média de pontos"
              valor={`${mediaPontos.toLocaleString("pt-BR")} pts`}
              descricao="Média geral do programa"
              icon={<TrendingUp size={28} />}
              destaque="escuro"
            />
          </section>

          {topPaciente && (
            <section className="bg-white rounded-[2rem] shadow-xl p-6 lg:p-8 mb-8 border border-white">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#fff8e6] to-[#eaf3e5] p-6 lg:p-8">
                <div className="absolute right-6 top-6 text-yellow-300/40">
                  <Crown size={140} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center shadow">
                      🥇
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#174f8c] uppercase tracking-wide">
                        Primeiro lugar
                      </p>
                      <h2 className="text-3xl lg:text-5xl font-black">
                        {topPaciente.nome}
                      </h2>
                    </div>
                  </div>

                  <p className="text-gray-500">{topPaciente.telefone}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <InfoBox
                      label="Pontuação"
                      value={`${topPaciente.pontos.toLocaleString("pt-BR")} pts`}
                    />
                    <InfoBox label="Nível" value={topPaciente.nivel} />
                    <InfoBox label="Status" value={topPaciente.status} />
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="bg-white rounded-[2rem] shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Medal className="text-[#4c9a2a]" />
                  Lista completa
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Ranking atualizado automaticamente pelo Supabase.
                </p>
              </div>

              <span className="bg-[#eef4fa] text-[#174f8c] px-4 py-2 rounded-xl font-bold">
                {ranking.length} pacientes
              </span>
            </div>

            <div className="space-y-4">
              {ranking.map((paciente, index) => {
                const isTop3 = index < 3;

                return (
                  <div
                    key={paciente.id}
                    className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-[1.5rem] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      index === 0
                        ? "bg-[#fff8e6] border border-yellow-200"
                        : index === 1
                        ? "bg-[#f4f6f8] border border-gray-200"
                        : index === 2
                        ? "bg-[#fff1e8] border border-orange-200"
                        : "bg-[#f7fafc] border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow ${
                          index === 0
                            ? "bg-yellow-100"
                            : index === 1
                            ? "bg-gray-100"
                            : index === 2
                            ? "bg-orange-100"
                            : "bg-white"
                        }`}
                      >
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black">
                            {paciente.nome}
                          </h3>
                          {isTop3 && (
                            <Star size={18} className="text-[#4c9a2a]" />
                          )}
                        </div>

                        <p className="text-gray-500">{paciente.telefone}</p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-2xl font-black text-[#174f8c]">
                        {(paciente.pontos || 0).toLocaleString("pt-BR")} pts
                      </p>

                      <span className="inline-block mt-2 bg-[#eaf3e5] text-[#4c9a2a] px-3 py-1 rounded-full font-bold text-sm">
                        {paciente.nivel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function CardPremium({
  titulo,
  valor,
  descricao,
  icon,
  destaque,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  icon: React.ReactNode;
  destaque: "azul" | "verde" | "escuro";
}) {
  const estilo =
    destaque === "azul"
      ? "from-[#174f8c] to-[#071d3a]"
      : destaque === "verde"
      ? "from-[#4c9a2a] to-[#2f6818]"
      : "from-[#071d3a] to-[#174f8c]";

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${estilo} rounded-[2rem] p-6 text-white shadow-xl`}
    >
      <div className="absolute right-[-35px] top-[-35px] w-32 h-32 rounded-full bg-white/10" />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/75">{titulo}</p>
          <h2 className="text-3xl font-black mt-3">{valor}</h2>
          <p className="text-sm text-white/70 mt-2">{descricao}</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow">
      <p className="text-gray-500 text-sm">{label}</p>
      <h3 className="text-2xl font-black mt-2">{value}</h3>
    </div>
  );
}