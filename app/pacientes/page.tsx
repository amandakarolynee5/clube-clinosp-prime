"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Search,
  Users,
  Star,
  Trophy,
  UserPlus,
  PlusCircle,
  CheckCircle,
  Sparkles,
  Crown,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  Paciente,
  getPacientes,
  adicionarPontosPaciente,
} from "../lib/services/pacientesService";

type Configuracoes = {
  pontos_consulta: number;
  pontos_indicacao: number;
  pontos_prevencao: number;
  pontos_manutencao: number;
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [config, setConfig] = useState<Configuracoes>({
    pontos_consulta: 50,
    pontos_indicacao: 150,
    pontos_prevencao: 80,
    pontos_manutencao: 100,
  });

  const [busca, setBusca] = useState("");
  const [nivelFiltro, setNivelFiltro] = useState("Todos");
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarPacientes();
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    const { data, error } = await supabase
      .from("configuracoes")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setConfig({
        pontos_consulta: data.pontos_consulta || 50,
        pontos_indicacao: data.pontos_indicacao || 150,
        pontos_prevencao: data.pontos_prevencao || 80,
        pontos_manutencao: data.pontos_manutencao || 100,
      });
    }
  }

  async function carregarPacientes() {
    try {
      setCarregando(true);
      const data = await getPacientes();
      setPacientes(data);
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao carregar pacientes");
    } finally {
      setCarregando(false);
    }
  }

  function proximoNivel(pontos: number) {
    if (pontos < 1000) return { nome: "Prata", meta: 1000 };
    if (pontos < 2500) return { nome: "Ouro", meta: 2500 };
    if (pontos < 5000) return { nome: "Platina", meta: 5000 };
    if (pontos < 8000) return { nome: "Diamante", meta: 8000 };
    return { nome: "Máximo", meta: pontos };
  }

  function progressoNivel(pontos: number) {
    const proximo = proximoNivel(pontos);
    if (proximo.nome === "Máximo") return 100;
    return Math.min(Math.round((pontos / proximo.meta) * 100), 100);
  }

  function corNivel(nivel: string) {
    if (nivel === "Diamante") return "bg-blue-100 text-blue-700";
    if (nivel === "Platina") return "bg-slate-100 text-slate-700";
    if (nivel === "Ouro") return "bg-yellow-100 text-yellow-700";
    if (nivel === "Prata") return "bg-gray-100 text-gray-700";
    return "bg-[#eaf3e5] text-[#4c9a2a]";
  }

  function mostrarToast(mensagem: string) {
    setToast(mensagem);
    setTimeout(() => setToast(""), 2500);
  }

  async function adicionarPontos(paciente: Paciente, tipo: string) {
    const valores: Record<string, number> = {
      consulta: config.pontos_consulta,
      indicacao: config.pontos_indicacao,
      prevencao: config.pontos_prevencao,
      manutencao: config.pontos_manutencao,
    };

    const nomes: Record<string, string> = {
      consulta: "Consulta",
      indicacao: "Indicação",
      prevencao: "Prevenção",
      manutencao: "Manutenção",
    };

    try {
      const pontos = valores[tipo];

      await adicionarPontosPaciente(paciente, pontos, nomes[tipo]);

      setMenuAberto(null);
      mostrarToast(`${nomes[tipo]}: +${pontos} pontos adicionados!`);
      carregarPacientes();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao adicionar pontos");
    }
  }

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((paciente) => {
      const textoBusca = busca.toLowerCase();

      const combinaBusca =
        paciente.nome.toLowerCase().includes(textoBusca) ||
        paciente.telefone?.toLowerCase().includes(textoBusca);

      const combinaNivel =
        nivelFiltro === "Todos" || paciente.nivel === nivelFiltro;

      return combinaBusca && combinaNivel;
    });
  }, [pacientes, busca, nivelFiltro]);

  const totalPacientes = pacientes.length;

  const totalPontos = pacientes.reduce(
    (total, paciente) => total + (paciente.pontos || 0),
    0
  );

  const maiorPontuacao =
    pacientes.length > 0 ? Math.max(...pacientes.map((p) => p.pontos || 0)) : 0;

  const pacienteTop = [...pacientes].sort(
    (a, b) => (b.pontos || 0) - (a.pontos || 0)
  )[0];

  const pacientesVip = pacientes.filter(
    (p) => p.nivel === "Ouro" || p.nivel === "Platina" || p.nivel === "Diamante"
  ).length;

  return (
    <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-8 lg:p-10 text-white shadow-2xl mb-8">
        <div className="absolute right-[-80px] top-[-80px] w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-[35%] bottom-[-130px] w-96 h-96 rounded-full bg-[#9ac84b]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-5">
              <Sparkles size={16} />
              Gestão premium de pacientes
            </span>

            <h1 className="text-4xl lg:text-6xl font-black leading-tight">
              Pacientes
            </h1>

            <p className="text-white/80 mt-4 text-lg max-w-2xl">
              Gerencie pontos, níveis, evolução e engajamento dos pacientes no
              Clube Clinosp Prime.
            </p>
          </div>

          <Link href="/pacientes/novo">
            <button className="flex items-center justify-center gap-2 bg-white text-[#174f8c] hover:bg-[#f3f7fb] px-6 py-4 rounded-2xl font-black shadow transition">
              <UserPlus size={20} />
              Novo paciente
            </button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <CardResumo
          titulo="Pacientes cadastrados"
          valor={totalPacientes.toString()}
          descricao="Total no programa"
          icone={<Users />}
          cor="azul"
        />

        <CardResumo
          titulo="Pontos em circulação"
          valor={`${totalPontos.toLocaleString("pt-BR")} pts`}
          descricao="Saldo total disponível"
          icone={<Star />}
          cor="verde"
        />

        <CardResumo
          titulo="Maior pontuação"
          valor={`${maiorPontuacao.toLocaleString("pt-BR")} pts`}
          descricao={pacienteTop?.nome || "Sem paciente"}
          icone={<Trophy />}
          cor="dourado"
        />

        <CardResumo
          titulo="Pacientes VIP"
          valor={pacientesVip.toString()}
          descricao="Ouro, Platina ou Diamante"
          icone={<Crown />}
          cor="escuro"
        />
      </section>

      <section className="bg-white rounded-[2rem] shadow p-6 mb-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black">Lista de pacientes</h2>
            <p className="text-sm text-gray-500">
              Busque, filtre e adicione pontos conforme as regras das
              configurações.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative w-full md:w-96">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou telefone..."
                className="w-full border rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#174f8c]/20"
              />
            </div>

            <select
              value={nivelFiltro}
              onChange={(e) => setNivelFiltro(e.target.value)}
              className="border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#174f8c]/20 bg-white font-bold"
            >
              <option value="Todos">Todos os níveis</option>
              <option value="Bronze">Bronze</option>
              <option value="Prata">Prata</option>
              <option value="Ouro">Ouro</option>
              <option value="Platina">Platina</option>
              <option value="Diamante">Diamante</option>
            </select>
          </div>
        </div>

        {carregando ? (
          <p className="text-center py-14 text-gray-500 font-bold">
            Carregando pacientes...
          </p>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-gray-500 font-medium">
              Nenhum paciente encontrado.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Tente mudar a busca ou cadastrar um novo paciente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pacientesFiltrados.map((paciente) => {
              const proximo = proximoNivel(paciente.pontos || 0);
              const progresso = progressoNivel(paciente.pontos || 0);

              return (
                <div
                  key={paciente.id}
                  className="bg-[#f7fafc] border border-gray-100 rounded-[1.7rem] p-5 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:items-center">
                    <div className="xl:col-span-3">
                      <p className="font-black text-lg">{paciente.nome}</p>
                      <p className="text-sm text-gray-500">
                        {paciente.telefone}
                      </p>
                    </div>

                    <div className="xl:col-span-2">
                      <p className="text-sm text-gray-500">Pontos</p>
                      <p className="text-2xl font-black text-[#174f8c]">
                        {(paciente.pontos || 0).toLocaleString("pt-BR")} pts
                      </p>
                    </div>

                    <div className="xl:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Nível</p>
                      <span
                        className={`${corNivel(
                          paciente.nivel
                        )} px-3 py-1 rounded-full font-bold text-sm`}
                      >
                        {paciente.nivel}
                      </span>
                    </div>

                    <div className="xl:col-span-3">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>
                          {proximo.nome === "Máximo"
                            ? "Nível máximo"
                            : `Rumo ao ${proximo.nome}`}
                        </span>
                        <span>{progresso}%</span>
                      </div>

                      <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#174f8c] to-[#4c9a2a] rounded-full transition-all duration-700"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                    </div>

                    <div className="xl:col-span-2 flex flex-wrap gap-2 xl:justify-end">
                      <Link href={`/pacientes/${paciente.id}`}>
                        <button className="px-4 py-2 rounded-xl bg-[#174f8c] text-white font-bold shadow">
                          Ver
                        </button>
                      </Link>

                      <Link href={`/pacientes/${paciente.id}/editar`}>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4c9a2a] text-white font-bold shadow hover:bg-[#3f8423] transition">
                          <Pencil size={16} />
                          Editar
                        </button>
                      </Link>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuAberto(
                              menuAberto === paciente.id ? null : paciente.id
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white font-bold text-[#071d3a] hover:bg-[#eef4fa] transition shadow-sm"
                        >
                          <PlusCircle size={17} />
                          Pontos
                        </button>

                        {menuAberto === paciente.id && (
                          <div className="absolute right-0 top-12 z-50 bg-white rounded-3xl shadow-2xl border p-2 w-72">
                            <BotaoPonto
                              emoji="📅"
                              titulo="Consulta"
                              pontos={`+${config.pontos_consulta}`}
                              descricao="Comparecimento"
                              onClick={() =>
                                adicionarPontos(paciente, "consulta")
                              }
                              icon={<UserCheck size={18} />}
                            />

                            <BotaoPonto
                              emoji="👥"
                              titulo="Indicação"
                              pontos={`+${config.pontos_indicacao}`}
                              descricao="Paciente indicou alguém"
                              onClick={() =>
                                adicionarPontos(paciente, "indicacao")
                              }
                              icon={<Users size={18} />}
                            />

                            <BotaoPonto
                              emoji="🛡️"
                              titulo="Prevenção"
                              pontos={`+${config.pontos_prevencao}`}
                              descricao="Ação preventiva"
                              onClick={() =>
                                adicionarPontos(paciente, "prevencao")
                              }
                              icon={<ShieldCheck size={18} />}
                            />

                            <BotaoPonto
                              emoji="🦷"
                              titulo="Manutenção"
                              pontos={`+${config.pontos_manutencao}`}
                              descricao="Retorno programado"
                              onClick={() =>
                                adicionarPontos(paciente, "manutencao")
                              }
                              icon={<TrendingUp size={18} />}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 bg-[#071d3a] text-white px-5 py-4 rounded-2xl shadow-2xl font-bold">
          <CheckCircle size={20} className="text-[#9ac84b]" />
          {toast}
        </div>
      )}
    </main>
  );
}

function BotaoPonto({
  emoji,
  titulo,
  pontos,
  descricao,
  onClick,
  icon,
}: {
  emoji: string;
  titulo: string;
  pontos: string;
  descricao: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl hover:bg-[#f3f7fb] transition text-left"
    >
      <span className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
          {emoji}
        </span>

        <span>
          <span className="flex items-center gap-1 font-black">
            {icon}
            {titulo}
          </span>
          <span className="block text-xs text-gray-500">{descricao}</span>
        </span>
      </span>

      <span className="text-[#4c9a2a] font-black">{pontos}</span>
    </button>
  );
}

function CardResumo({
  titulo,
  valor,
  descricao,
  icone,
  cor,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  icone: ReactNode;
  cor: "azul" | "verde" | "dourado" | "escuro";
}) {
  const cores = {
    azul: "from-[#174f8c] to-[#071d3a]",
    verde: "from-[#4c9a2a] to-[#2f6818]",
    dourado: "from-[#f2b705] to-[#b88400]",
    escuro: "from-[#071d3a] to-[#174f8c]",
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${cores[cor]} rounded-[2rem] shadow-xl p-6 text-white`}
    >
      <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full bg-white/10" />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/75">{titulo}</p>
          <h2 className="text-3xl font-black mt-3">{valor}</h2>
          <p className="text-sm text-white/70 mt-2">{descricao}</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
          {icone}
        </div>
      </div>
    </div>
  );
}