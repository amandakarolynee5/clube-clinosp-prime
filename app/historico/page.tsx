"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  History,
  Star,
  Gift,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Movimentacao = {
  id: string;
  tipo: string;
  descricao: string;
  pontos: number;
  created_at: string;
  pacientes?: {
    nome: string;
  } | null;
};

type Resgate = {
  id: string;
  pontos_usados: number;
  status: string;
  created_at: string;
  pacientes?: {
    nome: string;
  } | null;
  brindes?: {
    nome: string;
  } | null;
};

export default function HistoricoPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
    setCarregando(true);

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

    const { data: movimentacoesData, error: erroMovimentacoes } = await supabase
      .from("movimentacoes")
      .select(`
        id,
        tipo,
        descricao,
        pontos,
        created_at,
        pacientes(nome)
      `)
      .order("created_at", { ascending: false });

    if (erroResgates) console.error(erroResgates);
    if (erroMovimentacoes) console.error(erroMovimentacoes);

    const resgatesFormatados =
      resgatesData?.map((item: any) => ({
        ...item,
        pacientes: Array.isArray(item.pacientes)
          ? item.pacientes[0]
          : item.pacientes,
        brindes: Array.isArray(item.brindes) ? item.brindes[0] : item.brindes,
      })) || [];

    const movimentacoesFormatadas =
      movimentacoesData?.map((item: any) => ({
        ...item,
        pacientes: Array.isArray(item.pacientes)
          ? item.pacientes[0]
          : item.pacientes,
      })) || [];

    setResgates(resgatesFormatados as Resgate[]);
    setMovimentacoes(movimentacoesFormatadas as Movimentacao[]);

    setCarregando(false);
  }

  async function alterarStatus(id: string, novoStatus: string) {
    const { error } = await supabase
      .from("resgates")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao alterar status.");
      return;
    }

    carregarHistorico();
  }

  function corStatus(status: string) {
    if (status === "Entregue" || status === "entregue")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    if (status === "Cancelado" || status === "cancelado")
      return "bg-red-50 text-red-700 border-red-200";

    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  function IconeStatus({ status }: { status: string }) {
    if (status === "Entregue" || status === "entregue")
      return <CheckCircle size={18} />;

    if (status === "Cancelado" || status === "cancelado")
      return <XCircle size={18} />;

    return <Clock size={18} />;
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString("pt-BR");
  }

  const totalPontos = movimentacoes.reduce(
    (total, item) => total + item.pontos,
    0
  );

  const resgatesPendentes = resgates.filter(
    (item) => item.status === "Pendente" || item.status === "pendente"
  ).length;

  const resgatesEntregues = resgates.filter(
    (item) => item.status === "Entregue" || item.status === "entregue"
  ).length;

  const resgatesCancelados = resgates.filter(
    (item) => item.status === "Cancelado" || item.status === "cancelado"
  ).length;

  const resgatesFiltrados = resgates.filter((item) => {
    const texto = busca.toLowerCase();

    return (
      item.pacientes?.nome?.toLowerCase().includes(texto) ||
      item.brindes?.nome?.toLowerCase().includes(texto) ||
      item.status?.toLowerCase().includes(texto)
    );
  });

  const movimentacoesFiltradas = movimentacoes.filter((item) => {
    const texto = busca.toLowerCase();

    return (
      item.pacientes?.nome?.toLowerCase().includes(texto) ||
      item.tipo?.toLowerCase().includes(texto) ||
      item.descricao?.toLowerCase().includes(texto)
    );
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef4fa] via-[#f8fbff] to-[#eef7ee] p-6 lg:p-8 text-[#071d3a]">
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-8 text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 rounded-full bg-[#9ac84b]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm font-bold mb-4">
                <Sparkles size={16} />
                Clube Clinosp Prime
              </div>

              <h1 className="text-4xl lg:text-5xl font-black">
                Histórico
              </h1>

              <p className="text-white/80 mt-3 max-w-2xl">
                Acompanhe movimentações de pontos, resgates e status dos
                benefícios entregues aos pacientes.
              </p>
            </div>

            <button
              onClick={carregarHistorico}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#174f8c] px-5 py-3 font-black shadow-xl hover:scale-[1.03] transition"
            >
              <RefreshCcw size={18} />
              Atualizar
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <CardResumo
          titulo="Pontos movimentados"
          valor={`${totalPontos.toLocaleString("pt-BR")} pts`}
          icone={<Star className="text-[#4c9a2a]" />}
        />

        <CardResumo
          titulo="Resgates pendentes"
          valor={resgatesPendentes.toString()}
          icone={<Clock className="text-amber-600" />}
        />

        <CardResumo
          titulo="Entregues"
          valor={resgatesEntregues.toString()}
          icone={<CheckCircle className="text-emerald-600" />}
        />

        <CardResumo
          titulo="Cancelados"
          valor={resgatesCancelados.toString()}
          icone={<XCircle className="text-red-600" />}
        />
      </section>

      <section className="mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-xl p-4 flex items-center gap-3">
          <Search className="text-[#174f8c]" size={20} />

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por paciente, brinde, status ou tipo..."
            className="w-full bg-transparent outline-none font-semibold text-[#071d3a] placeholder:text-gray-400"
          />
        </div>
      </section>

      {carregando && (
        <p className="font-bold text-[#174f8c] mb-6">
          Carregando histórico...
        </p>
      )}

      <section className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white p-6 mb-8">
        <TituloSecao
          icone={<Gift className="text-[#4c9a2a]" />}
          titulo="Histórico de Resgates"
          subtitulo="Controle os resgates pendentes, entregues ou cancelados."
          fundo="bg-[#eaf3e5]"
        />

        {resgatesFiltrados.length === 0 ? (
          <EstadoVazio texto="Nenhum resgate encontrado." />
        ) : (
          <div className="space-y-4">
            {resgatesFiltrados.map((item) => (
              <div
                key={item.id}
                className="group bg-gradient-to-r from-[#f8fbff] to-white rounded-3xl p-5 border border-[#e8eef5] hover:border-[#9ac84b]/50 hover:shadow-xl transition-all"
              >
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:items-center">
                  <div className="xl:col-span-3">
                    <p className="font-black text-lg">
                      {item.pacientes?.nome || "Paciente"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatarData(item.created_at)}
                    </p>
                  </div>

                  <div className="xl:col-span-3">
                    <p className="text-sm text-gray-500">Brinde</p>
                    <p className="font-bold">
                      {item.brindes?.nome || "Brinde"}
                    </p>
                  </div>

                  <div className="xl:col-span-2">
                    <p className="text-sm text-gray-500">Pontos usados</p>
                    <p className="font-black text-red-500">
                      -{item.pontos_usados.toLocaleString("pt-BR")} pts
                    </p>
                  </div>

                  <div className="xl:col-span-2">
                    <span
                      className={`${corStatus(
                        item.status
                      )} inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-black border`}
                    >
                      <IconeStatus status={item.status} />
                      {item.status}
                    </span>
                  </div>

                  <div className="xl:col-span-2">
                    <select
                      value={item.status}
                      onChange={(e) => alterarStatus(item.id, e.target.value)}
                      className="w-full border border-[#dbe7f3] rounded-2xl px-4 py-3 outline-none bg-white font-bold shadow-sm focus:ring-2 focus:ring-[#4c9a2a]/30"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white p-6">
        <TituloSecao
          icone={<History className="text-[#174f8c]" />}
          titulo="Histórico de Pontos"
          subtitulo="Veja todas as pontuações adicionadas aos pacientes."
          fundo="bg-[#eef3fb]"
        />

        {movimentacoesFiltradas.length === 0 ? (
          <EstadoVazio texto="Nenhuma movimentação encontrada." />
        ) : (
          <div className="space-y-4">
            {movimentacoesFiltradas.map((item) => (
              <div
                key={item.id}
                className="group bg-gradient-to-r from-[#f8fbff] to-white rounded-3xl p-5 border border-[#e8eef5] hover:border-[#174f8c]/30 hover:shadow-xl transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:items-center">
                  <div>
                    <p className="text-sm text-gray-500">Paciente</p>
                    <p className="font-black">
                      {item.pacientes?.nome || "Paciente"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-bold">{item.tipo}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Pontos</p>
                    <p
                      className={`font-black ${
                        item.pontos >= 0 ? "text-[#4c9a2a]" : "text-red-500"
                      }`}
                    >
                      {item.pontos >= 0 ? "+" : ""}
                      {item.pontos.toLocaleString("pt-BR")} pts
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium text-gray-600">
                      {formatarData(item.created_at)}
                    </p>
                  </div>
                </div>

                {item.descricao && (
                  <div className="mt-4 rounded-2xl bg-[#eef4fa] px-4 py-3 text-sm text-gray-600 font-medium">
                    {item.descricao}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CardResumo({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor: string;
  icone: React.ReactNode;
}) {
  return (
    <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-6 hover:-translate-y-1 hover:shadow-2xl transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 font-semibold">{titulo}</p>
          <h2 className="text-3xl font-black mt-3 text-[#071d3a]">
            {valor}
          </h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#f3f7fb] flex items-center justify-center shadow-inner group-hover:scale-110 transition">
          {icone}
        </div>
      </div>
    </div>
  );
}

function TituloSecao({
  icone,
  titulo,
  subtitulo,
  fundo,
}: {
  icone: React.ReactNode;
  titulo: string;
  subtitulo: string;
  fundo: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`w-12 h-12 rounded-2xl ${fundo} flex items-center justify-center shadow-inner`}
      >
        {icone}
      </div>

      <div>
        <h2 className="text-2xl font-black">{titulo}</h2>
        <p className="text-sm text-gray-500">{subtitulo}</p>
      </div>
    </div>
  );
}

function EstadoVazio({ texto }: { texto: string }) {
  return (
    <div className="text-center py-14 rounded-3xl bg-[#f8fbff] border border-dashed border-[#dbe7f3]">
      <p className="text-gray-500 font-semibold">{texto}</p>
    </div>
  );
}