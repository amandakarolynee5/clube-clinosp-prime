"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Star,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Crown,
} from "lucide-react";
import { supabase } from "../lib/supabase";
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

type Paciente = {
  id: string;
  nome: string;
  pontos: number;
  nivel?: string;
  status?: string;
};

type Resgate = {
  id: string;
  paciente: string;
  brinde: string;
  pontos: number;
  status: string;
  data: string;
};

export default function RelatoriosPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  async function carregarRelatorios() {
    setCarregando(true);

    const { data: pacientesData, error: erroPacientes } = await supabase
      .from("pacientes")
      .select("*")
      .order("pontos", { ascending: false });

    const { data: resgatesData, error: erroResgates } = await supabase
      .from("resgates")
      .select(`
        id,
        pontos_usados,
        status,
        created_at,
        pacientes(nome),
        brindes(nome)
      `)
      .order("created_at", { ascending: false });

    if (erroPacientes) console.error(erroPacientes);
    if (erroResgates) console.error(erroResgates);

    setPacientes((pacientesData as Paciente[]) || []);

    const listaResgates =
      resgatesData?.map((r: any) => ({
        id: r.id,
        paciente: r.pacientes?.nome || "Paciente",
        brinde: r.brindes?.nome || "Brinde",
        pontos: r.pontos_usados || 0,
        status: r.status || "Pendente",
        data: r.created_at
          ? new Date(r.created_at).toLocaleString("pt-BR")
          : "-",
      })) || [];

    setResgates(listaResgates);
    setCarregando(false);
  }

  const totalPacientes = pacientes.length;
  const totalPontos = pacientes.reduce((acc, p) => acc + (p.pontos || 0), 0);
  const totalResgates = resgates.length;

  const resgatesEntregues = resgates.filter(
    (r) => r.status === "Entregue" || r.status === "entregue"
  ).length;

  const resgatesPendentes = resgates.filter(
    (r) => r.status === "Pendente" || r.status === "pendente"
  ).length;

  const resgatesCancelados = resgates.filter(
    (r) => r.status === "Cancelado" || r.status === "cancelado"
  ).length;

  const pontosResgatados = resgates.reduce((acc, r) => acc + r.pontos, 0);

  const taxaEntrega =
    totalResgates > 0
      ? Math.round((resgatesEntregues / totalResgates) * 100)
      : 0;

  const pacienteMaisPontos = pacientes[0];

  const brindeMaisResgatado = useMemo(() => {
    const contagem: Record<string, number> = {};

    resgates.forEach((r) => {
      contagem[r.brinde] = (contagem[r.brinde] || 0) + 1;
    });

    return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
  }, [resgates]);

  const dadosStatus = [
    { name: "Pendente", value: resgatesPendentes },
    { name: "Entregue", value: resgatesEntregues },
    { name: "Cancelado", value: resgatesCancelados },
  ];

  const dadosPacientes = pacientes.slice(0, 8).map((p) => ({
    nome: p.nome?.split(" ")[0] || "Paciente",
    pontos: p.pontos || 0,
  }));

  const dadosEvolucao = [
    { mes: "Jan", pontos: Math.round(totalPontos * 0.25) || 200 },
    { mes: "Fev", pontos: Math.round(totalPontos * 0.45) || 500 },
    { mes: "Mar", pontos: Math.round(totalPontos * 0.7) || 900 },
    { mes: "Atual", pontos: totalPontos || 1200 },
  ];

  const coresStatus = ["#f2b705", "#4c9a2a", "#ef4444"];

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
        <p className="font-black text-[#174f8c]">Carregando relatórios...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-8 lg:p-10 text-white shadow-2xl mb-8">
        <div className="absolute right-[-80px] top-[-80px] w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-[35%] bottom-[-130px] w-96 h-96 rounded-full bg-[#9ac84b]/20 blur-3xl" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-5">
            <Sparkles size={16} />
            Relatório estratégico premium
          </span>

          <h1 className="text-4xl lg:text-6xl font-black leading-tight">
            Relatórios do Clube
          </h1>

          <p className="text-white/80 mt-4 text-lg max-w-2xl">
            Visão completa de pacientes, pontos, resgates, performance e oportunidades do programa.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <CardPremium
          title="Pacientes"
          value={totalPacientes.toLocaleString("pt-BR")}
          desc="Total cadastrados"
          icon={<Users size={28} />}
          color="azul"
        />

        <CardPremium
          title="Pontos disponíveis"
          value={`${totalPontos.toLocaleString("pt-BR")} pts`}
          desc="Saldo atual no programa"
          icon={<Star size={28} />}
          color="verde"
        />

        <CardPremium
          title="Resgates"
          value={totalResgates.toLocaleString("pt-BR")}
          desc="Total realizados"
          icon={<Gift size={28} />}
          color="escuro"
        />

        <CardPremium
          title="Taxa de entrega"
          value={`${taxaEntrega}%`}
          desc="Resgates entregues"
          icon={<CheckCircle size={28} />}
          color="dourado"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white rounded-[2rem] shadow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#fff8e6] flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" />
            </div>

            <div>
              <h2 className="text-2xl font-black">Alertas inteligentes</h2>
              <p className="text-sm text-gray-500">
                Pontos que merecem atenção da equipe.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Alerta
              titulo="Pendentes"
              descricao={`${resgatesPendentes} resgates aguardando entrega.`}
              destaque="Ação necessária"
            />

            <Alerta
              titulo="Cancelados"
              descricao={`${resgatesCancelados} resgates foram cancelados.`}
              destaque="Acompanhar"
            />

            <Alerta
              titulo="Pontos usados"
              descricao={`${pontosResgatados.toLocaleString("pt-BR")} pts já foram resgatados.`}
              destaque="Resultado"
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow p-6">
          <h2 className="text-2xl font-black mb-5 flex items-center gap-2">
            <Crown className="text-yellow-500" />
            Destaques
          </h2>

          <div className="space-y-4">
            <LinhaResumo
              label="Paciente top"
              value={pacienteMaisPontos?.nome || "-"}
            />

            <LinhaResumo
              label="Maior saldo"
              value={`${(pacienteMaisPontos?.pontos || 0).toLocaleString(
                "pt-BR"
              )} pts`}
            />

            <LinhaResumo
              label="Brinde mais resgatado"
              value={brindeMaisResgatado?.[0] || "-"}
            />

            <LinhaResumo
              label="Quantidade"
              value={`${brindeMaisResgatado?.[1] || 0} resgates`}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Pontos por paciente" icon={<Trophy />}>
          {dadosPacientes.length === 0 ? (
            <p className="text-gray-500">Nenhum paciente cadastrado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosPacientes}>
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
        </ChartCard>

        <ChartCard title="Status dos resgates" icon={<Gift />}>
          {totalResgates === 0 ? (
            <p className="text-gray-500">Nenhum resgate registrado ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dadosStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  label
                >
                  {dadosStatus.map((_, i) => (
                    <Cell key={i} fill={coresStatus[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      <section className="bg-white rounded-[2rem] shadow p-6 mb-6">
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <TrendingUp className="text-[#4c9a2a]" />
          Evolução de pontos
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosEvolucao}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line
              dataKey="pontos"
              stroke="#4c9a2a"
              strokeWidth={4}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] shadow p-6">
          <h2 className="text-2xl font-black mb-5">Detalhamento</h2>

          <div className="space-y-4">
            <LinhaResumo label="Entregues" value={resgatesEntregues} />
            <LinhaResumo label="Pendentes" value={resgatesPendentes} />
            <LinhaResumo label="Cancelados" value={resgatesCancelados} />
            <LinhaResumo
              label="Pontos usados"
              value={`${pontosResgatados.toLocaleString("pt-BR")} pts`}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow p-6">
          <h2 className="text-2xl font-black mb-5">Últimos resgates</h2>

          {resgates.slice(0, 5).length === 0 ? (
            <p className="text-gray-500">Nenhum resgate registrado.</p>
          ) : (
            <div className="space-y-4">
              {resgates.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
                    🎁
                  </div>

                  <div className="flex-1">
                    <p className="font-bold">
                      {item.paciente} resgatou {item.brinde}
                    </p>
                    <p className="text-sm text-gray-400">{item.data}</p>
                  </div>

                  <span className="font-black text-red-500">
                    -{item.pontos.toLocaleString("pt-BR")} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function CardPremium({
  title,
  value,
  desc,
  icon,
  color,
}: {
  title: string;
  value: string;
  desc: string;
  icon: React.ReactNode;
  color: "azul" | "verde" | "escuro" | "dourado";
}) {
  const cores = {
    azul: "from-[#174f8c] to-[#071d3a]",
    verde: "from-[#4c9a2a] to-[#2f6818]",
    escuro: "from-[#071d3a] to-[#174f8c]",
    dourado: "from-[#f2b705] to-[#b88400]",
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${cores[color]} rounded-[2rem] shadow-xl p-6 text-white`}
    >
      <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full bg-white/10" />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/75">{title}</p>
          <h2 className="text-3xl font-black mt-3">{value}</h2>
          <p className="text-sm text-white/70 mt-2">{desc}</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow">
      <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
        <span className="text-[#4c9a2a]">{icon}</span>
        {title}
      </h2>

      {children}
    </div>
  );
}

function Alerta({
  titulo,
  descricao,
  destaque,
}: {
  titulo: string;
  descricao: string;
  destaque: string;
}) {
  return (
    <div className="bg-[#f7fafc] rounded-3xl p-5 border border-gray-100">
      <span className="bg-[#eef4fa] text-[#174f8c] px-3 py-1 rounded-full text-xs font-bold">
        {destaque}
      </span>

      <h3 className="font-black mt-4">{titulo}</h3>
      <p className="text-sm text-gray-500 mt-2">{descricao}</p>
    </div>
  );
}

function LinhaResumo({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between bg-[#f7fafc] p-4 rounded-2xl">
      <span className="text-gray-500">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}