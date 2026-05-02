"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, History, Star, Gift } from "lucide-react";
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
        brindes: Array.isArray(item.brindes)
          ? item.brindes[0]
          : item.brindes,
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
      return "bg-green-100 text-green-700";

    if (status === "Cancelado" || status === "cancelado")
      return "bg-red-100 text-red-700";

    return "bg-yellow-100 text-yellow-700";
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

  return (
    <main className="min-h-screen bg-[#f3f7fb] p-8 text-[#071d3a]">
      <section className="mb-8">
        <h1 className="text-4xl font-black">Histórico</h1>
        <p className="text-gray-500 mt-2">
          Acompanhe movimentações de pontos e controle os status dos resgates.
        </p>
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
          icone={<Clock className="text-yellow-600" />}
        />

        <CardResumo
          titulo="Entregues"
          valor={resgatesEntregues.toString()}
          icone={<CheckCircle className="text-green-600" />}
        />

        <CardResumo
          titulo="Cancelados"
          valor={resgatesCancelados.toString()}
          icone={<XCircle className="text-red-600" />}
        />
      </section>

      {carregando && (
        <p className="font-bold text-[#174f8c] mb-6">Carregando histórico...</p>
      )}

      <section className="bg-white rounded-3xl shadow p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
            <Gift className="text-[#4c9a2a]" />
          </div>

          <div>
            <h2 className="text-2xl font-black">Histórico de Resgates</h2>
            <p className="text-sm text-gray-500">
              Controle os resgates pendentes, entregues ou cancelados.
            </p>
          </div>
        </div>

        {resgates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum resgate registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resgates.map((item) => (
              <div
                key={item.id}
                className="bg-[#f3f7fb] rounded-3xl p-5 hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:items-center">
                  <div className="xl:col-span-3">
                    <p className="font-black">
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
                      )} inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-black`}
                    >
                      <IconeStatus status={item.status} />
                      {item.status}
                    </span>
                  </div>

                  <div className="xl:col-span-2">
                    <select
                      value={item.status}
                      onChange={(e) => alterarStatus(item.id, e.target.value)}
                      className="w-full border rounded-2xl px-4 py-3 outline-none bg-white font-bold"
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

      <section className="bg-white rounded-3xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#eef3fb] flex items-center justify-center">
            <History className="text-[#174f8c]" />
          </div>

          <div>
            <h2 className="text-2xl font-black">Histórico de Pontos</h2>
            <p className="text-sm text-gray-500">
              Veja todas as pontuações adicionadas aos pacientes.
            </p>
          </div>
        </div>

        {movimentacoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhuma movimentação registrada ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {movimentacoes.map((item) => (
              <div
                key={item.id}
                className="bg-[#f3f7fb] rounded-3xl p-5 hover:shadow-md transition"
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
    <div className="bg-white rounded-3xl shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500">{titulo}</p>
          <h2 className="text-3xl font-black mt-3">{valor}</h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#f3f7fb] flex items-center justify-center">
          {icone}
        </div>
      </div>
    </div>
  );
}