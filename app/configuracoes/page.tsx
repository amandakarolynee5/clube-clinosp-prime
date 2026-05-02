"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Star,
  UserCheck,
  Users,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Configuracao = {
  id: string;
  nome_programa: string;
  pontos_consulta: number;
  pontos_indicacao: number;
  pontos_prevencao: number;
  pontos_manutencao: number;
};

export default function ConfiguracoesPage() {
  const [configId, setConfigId] = useState("");
  const [nomePrograma, setNomePrograma] = useState("Clube Clinosp Prime");
  const [pontosConsulta, setPontosConsulta] = useState(50);
  const [pontosIndicacao, setPontosIndicacao] = useState(150);
  const [pontosPrevencao, setPontosPrevencao] = useState(80);
  const [pontosManutencao, setPontosManutencao] = useState(100);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function carregarConfiguracoes() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("configuracoes")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      mostrarToast("Erro ao carregar configurações");
      setCarregando(false);
      return;
    }

    const config = data as Configuracao;

    setConfigId(config.id);
    setNomePrograma(config.nome_programa);
    setPontosConsulta(config.pontos_consulta);
    setPontosIndicacao(config.pontos_indicacao);
    setPontosPrevencao(config.pontos_prevencao);
    setPontosManutencao(config.pontos_manutencao);

    setCarregando(false);
  }

  async function salvarConfiguracoes() {
    if (!nomePrograma.trim()) {
      mostrarToast("Informe o nome do programa");
      return;
    }

    setSalvando(true);

    const dados = {
      nome_programa: nomePrograma.trim(),
      pontos_consulta: pontosConsulta,
      pontos_indicacao: pontosIndicacao,
      pontos_prevencao: pontosPrevencao,
      pontos_manutencao: pontosManutencao,
    };

    const { error } = await supabase
      .from("configuracoes")
      .update(dados)
      .eq("id", configId);

    setSalvando(false);

    if (error) {
      console.error(error);
      mostrarToast("Erro ao salvar configurações");
      return;
    }

    mostrarToast("Configurações salvas com sucesso!");
  }

  function restaurarPadrao() {
    setNomePrograma("Clube Clinosp Prime");
    setPontosConsulta(50);
    setPontosIndicacao(150);
    setPontosPrevencao(80);
    setPontosManutencao(100);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
        <p className="font-black text-[#174f8c]">Carregando configurações...</p>
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
            Central de regras premium
          </span>

          <h1 className="text-4xl lg:text-6xl font-black leading-tight">
            Configurações
          </h1>

          <p className="text-white/80 mt-4 text-lg max-w-2xl">
            Ajuste as regras de pontuação do programa e mantenha o Clube Clinosp Prime alinhado à estratégia da clínica.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-[2rem] shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
              <Settings className="text-[#4c9a2a]" />
            </div>

            <div>
              <h2 className="text-2xl font-black">Regras do programa</h2>
              <p className="text-sm text-gray-500">
                Esses valores serão usados para pontuar os pacientes.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="font-bold">Nome do programa</label>
              <input
                value={nomePrograma}
                onChange={(e) => setNomePrograma(e.target.value)}
                className="mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#174f8c]/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CampoPontos
                label="Pontos por consulta"
                descricao="Quando o paciente comparece à consulta."
                value={pontosConsulta}
                onChange={setPontosConsulta}
                icon={<UserCheck />}
              />

              <CampoPontos
                label="Pontos por indicação"
                descricao="Quando o paciente indica alguém."
                value={pontosIndicacao}
                onChange={setPontosIndicacao}
                icon={<Users />}
              />

              <CampoPontos
                label="Pontos por prevenção"
                descricao="Ações preventivas e acompanhamento."
                value={pontosPrevencao}
                onChange={setPontosPrevencao}
                icon={<ShieldCheck />}
              />

              <CampoPontos
                label="Pontos por manutenção"
                descricao="Manutenções e retornos programados."
                value={pontosManutencao}
                onChange={setPontosManutencao}
                icon={<Star />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <button
                onClick={restaurarPadrao}
                className="flex items-center justify-center gap-2 bg-[#f3f7fb] text-[#174f8c] px-5 py-4 rounded-2xl font-black"
              >
                <RefreshCw size={20} />
                Restaurar padrão
              </button>

              <button
                onClick={salvarConfiguracoes}
                disabled={salvando}
                className="flex items-center justify-center gap-2 bg-[#174f8c] hover:bg-[#123d6e] disabled:opacity-60 text-white px-5 py-4 rounded-2xl font-black shadow"
              >
                <Save size={20} />
                {salvando ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow p-6">
            <h2 className="text-2xl font-black mb-5">Resumo atual</h2>

            <div className="space-y-4">
              <LinhaResumo label="Programa" value={nomePrograma} />
              <LinhaResumo label="Consulta" value={`${pontosConsulta} pts`} />
              <LinhaResumo label="Indicação" value={`${pontosIndicacao} pts`} />
              <LinhaResumo label="Prevenção" value={`${pontosPrevencao} pts`} />
              <LinhaResumo
                label="Manutenção"
                value={`${pontosManutencao} pts`}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#071d3a] to-[#174f8c] rounded-[2rem] shadow-xl p-6 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
              💎
            </div>

            <h2 className="text-2xl font-black">Uso estratégico</h2>

            <p className="text-white/75 mt-3">
              Use pontuações maiores para ações que geram mais valor para a clínica, como indicações e manutenções recorrentes.
            </p>
          </div>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#071d3a] text-white px-5 py-3 rounded-2xl shadow-2xl font-bold">
          {toast}
        </div>
      )}
    </main>
  );
}

function CampoPontos({
  label,
  descricao,
  value,
  onChange,
  icon,
}: {
  label: string;
  descricao: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#f7fafc] rounded-3xl p-5 border border-gray-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-white shadow flex items-center justify-center text-[#4c9a2a]">
          {icon}
        </div>

        <div>
          <label className="font-black">{label}</label>
          <p className="text-sm text-gray-500 mt-1">{descricao}</p>
        </div>
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border rounded-2xl px-4 py-3 outline-none bg-white focus:ring-2 focus:ring-[#174f8c]/20 font-bold"
      />
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
      <strong className="text-right">{value}</strong>
    </div>
  );
}