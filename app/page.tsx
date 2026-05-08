"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Star,
  Trophy,
  Gift,
  Users,
  Clock,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

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

type Resgate = {
  paciente: string;
  brinde: string;
  pontos: number;
  data: string;
  status: string;
};

type EvolucaoPontos = {
  mes: string;
  pontos: number;
};

export default function Dashboard() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [dadosEvolucao, setDadosEvolucao] = useState<EvolucaoPontos[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  function converterData(valor: string | null | undefined) {
    if (!valor) return null;

    const dataDireta = new Date(valor);
    if (!isNaN(dataDireta.getTime())) return dataDireta;

    const partes = valor.split(" ")[0]?.split("/");
    if (partes?.length === 3) {
      const [dia, mes, ano] = partes;
      const dataFormatada = new Date(Number(ano), Number(mes) - 1, Number(dia));

      if (!isNaN(dataFormatada.getTime())) return dataFormatada;
    }

    return null;
  }

  function gerarGraficoEvolucao(
    pacientesLista: Paciente[],
    totalFallback: number
  ) {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();

    const pontosPorMes: Record<number, number> = {};

    pacientesLista.forEach((paciente) => {
      const historico = paciente.historico || [];

      historico.forEach((item) => {
        const data = converterData(item.data);
        const pontos = Number(item.pontos) || 0;

        if (!data) return;
        if (data.getFullYear() !== anoAtual) return;
        if (pontos <= 0) return;

        const mes = data.getMonth();

        if (!pontosPorMes[mes]) {
          pontosPorMes[mes] = 0;
        }

        pontosPorMes[mes] += pontos;
      });
    });

    const mesesComDados = Object.keys(pontosPorMes)
      .map(Number)
      .sort((a, b) => a - b);

    if (mesesComDados.length === 0) {
      return [
        {
          mes: "Atual",
          pontos: totalFallback,
        },
      ];
    }

    let acumulado = 0;

    return mesesComDados.map((mesNumero, index) => {
      acumulado += pontosPorMes[mesNumero] || 0;

      const ultimo = index === mesesComDados.length - 1;

      return {
        mes: ultimo ? "Atual" : meses[mesNumero],
        pontos: acumulado,
      };
    });
  }

  async function carregarDashboard() {
    setCarregando(true);

    const { data: pacientesData, error: erroPacientes } = await supabase
      .from("pacientes")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: resgatesData, error: erroResgates } = await supabase
      .from("resgates")
      .select(`
        pontos_usados,
        status,
        created_at,
        pacientes(nome),
        brindes(nome)
      `)
      .order("created_at", { ascending: false });

    if (erroPacientes) console.error(erroPacientes);
    if (erroResgates) console.error(erroResgates);

    const pacientesFormatados = (pacientesData as Paciente[]) || [];

    const resgatesFormatados =
      resgatesData?.map((r: any) => ({
        paciente: r.pacientes?.nome || "Paciente",
        brinde: r.brindes?.nome || "Brinde",
        pontos: Number(r.pontos_usados) || 0,
        data: r.created_at
          ? new Date(r.created_at).toLocaleString("pt-BR")
          : "-",
        status: r.status || "Pendente",
      })) || [];

    const pontosAtuaisTemp = pacientesFormatados.reduce(
      (total, paciente) => total + (Number(paciente.pontos) || 0),
      0
    );

    const pontosResgatadosTemp = resgatesFormatados.reduce(
      (total, item) => total + (Number(item.pontos) || 0),
      0
    );

    const pontosDistribuidosFallback = pontosAtuaisTemp + pontosResgatadosTemp;

    setPacientes(pacientesFormatados);
    setResgates(resgatesFormatados);

    setDadosEvolucao(
      gerarGraficoEvolucao(pacientesFormatados, pontosDistribuidosFallback)
    );

    setCarregando(false);
  }

  const totalPacientes = pacientes.length;

  const pontosAtuais = pacientes.reduce(
    (total, paciente) => total + (Number(paciente.pontos) || 0),
    0
  );

  const pontosResgatados = resgates.reduce(
    (total, item) => total + (Number(item.pontos) || 0),
    0
  );

  const pontosDistribuidosHistorico = pacientes.reduce((total, paciente) => {
    const historico = paciente.historico || [];

    const somaHistorico = historico.reduce((soma, item) => {
      const pontos = Number(item.pontos) || 0;
      return pontos > 0 ? soma + pontos : soma;
    }, 0);

    return total + somaHistorico;
  }, 0);

  const pontosDistribuidos =
    pontosDistribuidosHistorico > 0
      ? pontosDistribuidosHistorico
      : pontosAtuais + pontosResgatados;

  const resgatesPendentes = resgates.filter(
    (item) => item.status === "Pendente" || item.status === "pendente"
  ).length;

  const resgatesEntregues = resgates.filter(
    (item) => item.status === "Entregue" || item.status === "entregue"
  ).length;

  const resgatesCancelados = resgates.filter(
    (item) => item.status === "Cancelado" || item.status === "cancelado"
  ).length;

  const topPacientes = [...pacientes]
    .sort((a, b) => (b.pontos || 0) - (a.pontos || 0))
    .slice(0, 5);

  const ultimosResgates = resgates.slice(0, 5);

  const pacientesSemPontos = pacientes.filter((p) => p.pontos === 0).length;

  const pacientesVip = pacientes.filter(
    (p) => p.nivel === "Ouro" || p.nivel === "Diamante"
  ).length;

  const pacientesComMuitosPontos = pacientes.filter(
    (p) => p.pontos >= 3000
  ).length;

  const alertas = [
    {
      titulo: "Resgates pendentes",
      descricao: `${resgatesPendentes} resgates aguardando entrega.`,
      tipo: "Atenção",
      icone: <Clock size={20} />,
      cor: "bg-yellow-100 text-yellow-700",
      mostrar: resgatesPendentes > 0,
    },
    {
      titulo: "Pacientes sem pontos",
      descricao: `${pacientesSemPontos} pacientes ainda não pontuaram.`,
      tipo: "Oportunidade",
      icone: <AlertCircle size={20} />,
      cor: "bg-blue-100 text-blue-700",
      mostrar: pacientesSemPontos > 0,
    },
    {
      titulo: "Pacientes VIP",
      descricao: `${pacientesVip} pacientes estão nos níveis Ouro ou Diamante.`,
      tipo: "Destaque",
      icone: <Sparkles size={20} />,
      cor: "bg-green-100 text-green-700",
      mostrar: pacientesVip > 0,
    },
    {
      titulo: "Alto saldo acumulado",
      descricao: `${pacientesComMuitosPontos} pacientes podem resgatar brindes premium.`,
      tipo: "Ação",
      icone: <TrendingUp size={20} />,
      cor: "bg-purple-100 text-purple-700",
      mostrar: pacientesComMuitosPontos > 0,
    },
  ].filter((alerta) => alerta.mostrar);

  const dadosPontosPacientes = pacientes.map((paciente) => ({
    nome: paciente.nome?.split(" ")[0] || "Paciente",
    pontos: paciente.pontos || 0,
  }));

  const dadosStatusResgates = [
    { name: "Pendente", value: resgatesPendentes },
    { name: "Entregue", value: resgatesEntregues },
    { name: "Cancelado", value: resgatesCancelados },
  ];

  const coresStatus = ["#f2b705", "#4c9a2a", "#ef4444"];

  const cards = [
    {
      title: "Pacientes cadastrados",
      value: totalPacientes,
      desc: "Total de pacientes ativos",
      icon: Users,
      bg: "from-[#174f8c] to-[#0b2a4a]",
    },
    {
      title: "Pontos disponíveis",
      value: pontosAtuais,
      desc: "Saldo atual dos pacientes",
      icon: Star,
      bg: "from-[#4c9a2a] to-[#2f6818]",
    },
    {
      title: "Pontos resgatados",
      value: pontosResgatados,
      desc: "Total usado em brindes",
      icon: Gift,
      bg: "from-[#071d3a] to-[#174f8c]",
    },
    {
      title: "Resgates pendentes",
      value: resgatesPendentes,
      desc: "Aguardando entrega",
      icon: Clock,
      bg: "from-[#f2b705] to-[#b88400]",
    },
  ];

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#f3f7fb] p-8 text-[#071d3a]">
        <p className="font-black text-[#174f8c]">Carregando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4fa] text-[#071d3a]">
      <section className="p-6 lg:p-10">
        <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-8 lg:p-10 text-white shadow-2xl mb-8">
          <div className="absolute right-[-80px] top-[-80px] w-80 h-80 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute left-[40%] bottom-[-120px] w-96 h-96 rounded-full bg-[#9ac84b]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-5">
                <Sparkles size={16} />
                Painel estratégico premium
              </span>

              <h1 className="text-4xl lg:text-6xl font-black leading-tight">
                Clube Clinosp Prime
              </h1>

              <p className="text-white/80 mt-4 text-lg max-w-2xl">
                Controle de fidelização, pontos, resgates e engajamento dos pacientes em tempo real.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-white/15 backdrop-blur rounded-2xl px-4 py-3">
                <Search size={20} className="text-white/70" />
                <input
                  className="outline-none text-sm w-52 bg-transparent placeholder:text-white/70 text-white"
                  placeholder="Buscar paciente..."
                />
              </div>

              <button className="w-12 h-12 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center hover:bg-white/25 transition">
                <Bell size={21} />
              </button>

              <div className="flex items-center gap-3 bg-white/15 backdrop-blur rounded-2xl p-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  👩
                </div>
                <div>
                  <p className="font-bold">Administrador</p>
                  <p className="text-sm text-white/70">Clinosp Prime</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className={`relative overflow-hidden bg-gradient-to-br ${card.bg} rounded-[2rem] shadow-xl p-6 text-white hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="absolute right-[-40px] top-[-40px] w-32 h-32 bg-white/10 rounded-full" />

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-white/75">{card.title}</p>
                    <h2 className="text-4xl font-black mt-3">
                      {card.value.toLocaleString("pt-BR")}
                    </h2>
                    <p className="text-sm text-white/70 mt-2">{card.desc}</p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                    <Icon size={27} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="bg-white rounded-[2rem] shadow p-6 mb-6 border border-white">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black">Alertas inteligentes</h2>
              <p className="text-gray-500 text-sm">
                Insights automáticos para acompanhar oportunidades e pendências.
              </p>
            </div>

            <span className="bg-[#eef4fa] text-[#174f8c] px-4 py-2 rounded-xl font-bold">
              {alertas.length} alertas
            </span>
          </div>

          {alertas.length === 0 ? (
            <p className="text-gray-500">
              Nenhum alerta no momento. O programa está em equilíbrio.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.titulo}
                  className="bg-[#f7fafc] rounded-3xl p-5 border border-gray-100 hover:shadow-lg transition"
                >
                  <span
                    className={`${alerta.cor} inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold`}
                  >
                    {alerta.icone}
                    {alerta.tipo}
                  </span>

                  <h3 className="font-black mt-4">{alerta.titulo}</h3>

                  <p className="text-sm text-gray-500 mt-2">
                    {alerta.descricao}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 relative overflow-hidden bg-white rounded-[2rem] shadow-xl p-6 border border-white">
            <div className="absolute right-[-80px] top-[-80px] w-52 h-52 bg-[#174f8c]/10 rounded-full blur-3xl" />
            <div className="absolute left-[-80px] bottom-[-80px] w-52 h-52 bg-[#4c9a2a]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                  <span className="inline-flex items-center gap-2 bg-[#eef4fa] text-[#174f8c] px-4 py-2 rounded-full text-xs font-black mb-3">
                    <TrendingUp size={15} />
                    Crescimento do programa
                  </span>

                  <h2 className="text-2xl font-black">Evolução de Pontos</h2>

                  <p className="text-gray-500 text-sm">
                    Visão geral dos pontos movimentados no programa.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[#174f8c] to-[#071d3a] text-white px-5 py-3 rounded-2xl font-black shadow-lg">
                  {pontosDistribuidos.toLocaleString("pt-BR")} pts distribuídos
                </div>
              </div>

              {dadosEvolucao.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center bg-[#f7fafc] rounded-3xl">
                  <p className="text-gray-500 font-bold">
                    Nenhuma movimentação registrada ainda.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dce5ef" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pontos"
                      stroke="#174f8c"
                      strokeWidth={4}
                      dot={{
                        r: 6,
                        strokeWidth: 3,
                        stroke: "#174f8c",
                        fill: "#ffffff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow p-6">
            <h2 className="text-2xl font-black mb-6">Status dos Resgates</h2>

            {resgates.length === 0 ? (
              <p className="text-gray-500">Nenhum resgate registrado ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosStatusResgates}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {dadosStatusResgates.map((_, index) => (
                      <Cell key={index} fill={coresStatus[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-[2rem] shadow p-6">
            <h2 className="text-2xl font-black mb-6">Pontos por Paciente</h2>

            {dadosPontosPacientes.length === 0 ? (
              <p className="text-gray-500">Nenhum paciente cadastrado.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosPontosPacientes}>
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="pontos"
                    fill="#174f8c"
                    radius={[12, 12, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-[2rem] shadow p-6">
            <h2 className="text-2xl font-black flex items-center gap-2 mb-6">
              <Trophy className="text-[#4c9a2a]" />
              Top Pacientes
            </h2>

            {topPacientes.length === 0 ? (
              <p className="text-gray-500">Nenhum paciente cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {topPacientes.map((paciente, index) => (
                  <div
                    key={paciente.id}
                    className="flex items-center justify-between bg-[#f7fafc] rounded-3xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow flex items-center justify-center text-xl">
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : index + 1}
                      </div>

                      <div>
                        <p className="font-black">{paciente.nome}</p>
                        <p className="text-sm text-gray-500">
                          {paciente.nivel}
                        </p>
                      </div>
                    </div>

                    <p className="font-black text-[#174f8c]">
                      {paciente.pontos.toLocaleString("pt-BR")} pts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-[2rem] shadow p-6">
            <h2 className="text-2xl font-black mb-6">Últimos Resgates</h2>

            {ultimosResgates.length === 0 ? (
              <p className="text-gray-500">Nenhum resgate realizado ainda.</p>
            ) : (
              <div className="space-y-4">
                {ultimosResgates.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
                      🎁
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-700">
                        {item.paciente} resgatou {item.brinde}
                      </p>
                      <p className="text-sm text-gray-400">{item.data}</p>
                    </div>

                    <span className="text-sm font-bold text-red-500">
                      -{item.pontos.toLocaleString("pt-BR")} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] shadow p-6">
            <h2 className="text-2xl font-black mb-6">Resumo do Programa</h2>

            <div className="space-y-4">
              <LinhaResumo
                label="Pontos distribuídos"
                value={`${pontosDistribuidos.toLocaleString("pt-BR")} pts`}
              />
              <LinhaResumo
                label="Pontos disponíveis"
                value={`${pontosAtuais.toLocaleString("pt-BR")} pts`}
              />
              <LinhaResumo
                label="Pontos resgatados"
                value={`${pontosResgatados.toLocaleString("pt-BR")} pts`}
              />
              <LinhaResumo
                label="Resgates realizados"
                value={resgates.length.toString()}
              />
              <LinhaResumo
                label="Resgates pendentes"
                value={resgatesPendentes.toString()}
              />
              <LinhaResumo
                label="Resgates entregues"
                value={resgatesEntregues.toString()}
              />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function LinhaResumo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-3 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}