"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  UserCheck,
  Sparkles,
  CheckCircle,
  X,
  Info,
  Search,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Brinde = {
  id: string;
  nome: string;
  pontos: number;
  imagem?: string | null;
  estoque: number;
  descricao?: string | null;
  especificacoes?: string | null;
};

type Paciente = {
  id: string;
  nome: string;
  telefone?: string | null;
  pontos: number;
  nivel: string;
};

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function ResgatesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [pacienteId, setPacienteId] = useState("");
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [brindeSelecionado, setBrindeSelecionado] = useState<Brinde | null>(null);
  const [toast, setToast] = useState("");
  const [carregando, setCarregando] = useState(false);

  const paciente = pacientes.find((p) => p.id === pacienteId);

  const pacientesFiltrados = pacientes.filter((p) => {
    const buscaOriginal = buscaPaciente.trim();

    if (!buscaOriginal) return false;

    const buscaTexto = normalizarTexto(buscaOriginal);
    const buscaNumeros = buscaOriginal.replace(/\D/g, "");

    const nome = normalizarTexto(p.nome || "");
    const telefone = (p.telefone || "").replace(/\D/g, "");

    const encontrouNome = nome.includes(buscaTexto);
    const encontrouTelefone =
      buscaNumeros.length > 0 && telefone.includes(buscaNumeros);

    return encontrouNome || encontrouTelefone;
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const { data: pacientesData } = await supabase
      .from("pacientes")
      .select("*")
      .order("nome", { ascending: true });

    const { data: brindesData } = await supabase
      .from("brindes")
      .select("*")
      .order("pontos", { ascending: true });

    setPacientes((pacientesData || []) as Paciente[]);
    setBrindes((brindesData || []) as Brinde[]);
    setCarregando(false);
  }

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function atualizarNivel(pontos: number) {
    if (pontos >= 8000) return "Diamante";
    if (pontos >= 5000) return "Platina";
    if (pontos >= 2500) return "Ouro";
    if (pontos >= 1000) return "Prata";
    return "Bronze";
  }

  function selecionarPaciente(p: Paciente) {
    setPacienteId(p.id);
    setBuscaPaciente(p.nome);
  }

  async function confirmarResgate() {
    if (!paciente || !brindeSelecionado) return;

    if (brindeSelecionado.estoque <= 0) {
      mostrarToast("Este brinde está esgotado.");
      return;
    }

    if (paciente.pontos < brindeSelecionado.pontos) {
      mostrarToast("Paciente não possui pontos suficientes.");
      return;
    }

    const novosPontos = paciente.pontos - brindeSelecionado.pontos;
    const novoNivel = atualizarNivel(novosPontos);

    const { error: erroPaciente } = await supabase
      .from("pacientes")
      .update({
        pontos: novosPontos,
        nivel: novoNivel,
      })
      .eq("id", paciente.id);

    if (erroPaciente) {
      mostrarToast("Erro ao atualizar paciente.");
      return;
    }

    const { error: erroBrinde } = await supabase
      .from("brindes")
      .update({
        estoque: brindeSelecionado.estoque - 1,
      })
      .eq("id", brindeSelecionado.id);

    if (erroBrinde) {
      mostrarToast("Erro ao atualizar estoque.");
      return;
    }

    const { error: erroResgate } = await supabase.from("resgates").insert([
      {
        paciente_id: paciente.id,
        brinde_id: brindeSelecionado.id,
        pontos_usados: brindeSelecionado.pontos,
        status: "Pendente",
      },
    ]);

    if (erroResgate) {
      mostrarToast("Erro ao registrar resgate.");
      return;
    }

    await supabase.from("movimentacoes").insert([
      {
        paciente_id: paciente.id,
        tipo: "Resgate",
        descricao: `Resgate solicitado: ${brindeSelecionado.nome}`,
        pontos: -brindeSelecionado.pontos,
      },
    ]);

    setBrindeSelecionado(null);
    mostrarToast("Resgate solicitado com sucesso!");
    await carregarDados();
  }

  function abrirDetalhes(brinde: Brinde) {
    if (!paciente) {
      mostrarToast("Selecione um paciente primeiro.");
      return;
    }

    setBrindeSelecionado(brinde);
  }

  return (
    <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-8 lg:p-10 text-white shadow-2xl mb-8">
        <div className="absolute right-[-80px] top-[-80px] w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-[35%] bottom-[-130px] w-96 h-96 rounded-full bg-[#9ac84b]/20 blur-3xl" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-5">
            <Sparkles size={16} />
            Área premium de resgates
          </span>

          <h1 className="text-4xl lg:text-6xl font-black leading-tight">
            Resgates
          </h1>

          <p className="text-white/80 mt-4 text-lg max-w-2xl">
            Escolha o paciente, visualize os brindes disponíveis e realize o
            resgate de forma simples e elegante.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] shadow p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
            <UserCheck className="text-[#4c9a2a]" />
          </div>

          <div>
            <h2 className="text-2xl font-black">Selecionar paciente</h2>
            <p className="text-sm text-gray-500">
              Pesquise pelo nome ou telefone do paciente.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={buscaPaciente}
            onChange={(e) => {
              setBuscaPaciente(e.target.value);
              setPacienteId("");
            }}
            placeholder="Pesquisar por nome ou telefone..."
            className="w-full rounded-2xl border bg-white py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-[#174f8c]/20"
          />

          {buscaPaciente.trim() && pacientesFiltrados.length > 0 && !pacienteId && (
            <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border bg-white shadow-xl">
              {pacientesFiltrados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selecionarPaciente(p)}
                  className="w-full px-5 py-4 text-left font-bold text-[#071d3a] hover:bg-[#eef4fa] transition"
                >
                  {p.nome}
                </button>
              ))}
            </div>
          )}

          {buscaPaciente.trim() && pacientesFiltrados.length === 0 && !pacienteId && (
            <div className="absolute z-40 mt-2 w-full rounded-2xl border bg-white px-5 py-4 text-sm font-bold text-gray-500 shadow-xl">
              Nenhum paciente encontrado.
            </div>
          )}
        </div>

        {paciente && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoBox label="Paciente" value={paciente.nome} />
            <InfoBox label="Telefone" value={paciente.telefone || "Não informado"} />
            <InfoBox
              label="Saldo disponível"
              value={`${paciente.pontos.toLocaleString("pt-BR")} pts`}
            />
            <InfoBox label="Nível atual" value={paciente.nivel} />
          </div>
        )}
      </section>

      <section className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <Gift className="text-[#4c9a2a]" />
          <div>
            <h2 className="text-3xl font-black">Catálogo de brindes</h2>
            <p className="text-gray-500">
              O paciente poderá visualizar foto, especificações, estoque e
              pontos necessários.
            </p>
          </div>
        </div>

        {carregando ? (
          <p className="font-bold text-[#174f8c]">Carregando brindes...</p>
        ) : brindes.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow p-10 text-center">
            <p className="text-gray-500 font-bold">Nenhum brinde cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {brindes.map((brinde) => {
              const esgotado = brinde.estoque <= 0;
              const pontosInsuficientes =
                paciente && paciente.pontos < brinde.pontos;

              return (
                <div
                  key={brinde.id}
                  className="group bg-white rounded-[2rem] shadow border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-60 bg-[#f3f7fb] overflow-hidden">
                    {brinde.imagem ? (
                      <img
                        src={brinde.imagem}
                        alt={brinde.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem imagem
                      </div>
                    )}

                    <div className="absolute top-4 right-4 bg-white/95 shadow px-4 py-2 rounded-full font-black text-[#174f8c]">
                      {brinde.pontos} pts
                    </div>

                    <div
                      className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-black shadow ${
                        esgotado
                          ? "bg-red-100 text-red-600"
                          : "bg-[#eaf3e5] text-[#4c9a2a]"
                      }`}
                    >
                      {esgotado ? "Esgotado" : "Disponível"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-black">{brinde.nome}</h3>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {brinde.descricao ||
                        "Brinde exclusivo do Clube Clinosp Prime."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <MiniInfo label="Estoque" value={brinde.estoque} />
                      <MiniInfo label="Pontos" value={`${brinde.pontos} pts`} />
                    </div>

                    <button
                      onClick={() => abrirDetalhes(brinde)}
                      disabled={!paciente}
                      className={`mt-5 w-full py-4 rounded-2xl font-black transition ${
                        paciente
                          ? "bg-[#174f8c] hover:bg-[#123d6e] text-white shadow"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {!paciente
                        ? "Selecione um paciente"
                        : esgotado
                        ? "Ver detalhes"
                        : pontosInsuficientes
                        ? "Ver detalhes"
                        : "Ver e resgatar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {brindeSelecionado && paciente && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden relative">
            <button
              onClick={() => setBrindeSelecionado(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full shadow"
            >
              <X />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-80 lg:h-full bg-[#f3f7fb]">
                {brindeSelecionado.imagem ? (
                  <img
                    src={brindeSelecionado.imagem}
                    alt={brindeSelecionado.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="p-7">
                <span className="inline-flex items-center gap-2 bg-[#eaf3e5] text-[#4c9a2a] px-4 py-2 rounded-full font-black text-sm mb-4">
                  <Info size={16} />
                  Detalhes do brinde
                </span>

                <h2 className="text-3xl font-black">
                  {brindeSelecionado.nome}
                </h2>

                <p className="text-gray-500 mt-3">
                  {brindeSelecionado.descricao ||
                    "Brinde exclusivo disponível para resgate."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Linha label="Paciente" value={paciente.nome} />

                  <Linha
                    label="Saldo atual"
                    value={`${paciente.pontos.toLocaleString("pt-BR")} pts`}
                  />

                  <Linha
                    label="Pontos necessários"
                    value={`${brindeSelecionado.pontos.toLocaleString(
                      "pt-BR"
                    )} pts`}
                  />

                  <Linha
                    label="Estoque disponível"
                    value={brindeSelecionado.estoque}
                  />
                </div>

                <div className="mt-6 bg-[#f7fafc] rounded-3xl p-5">
                  <h3 className="font-black mb-3">
                    Especificações do brinde
                  </h3>

                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {brindeSelecionado.especificacoes ||
                      "Nenhuma especificação cadastrada."}
                  </p>
                </div>

                <div className="mt-6 bg-[#eef4fa] rounded-3xl p-5">
                  <h3 className="font-black mb-2">Resumo do resgate</h3>

                  <div className="space-y-3">
                    <Resumo
                      label="Custo"
                      value={`-${brindeSelecionado.pontos.toLocaleString(
                        "pt-BR"
                      )} pts`}
                      danger
                    />

                    <Resumo
                      label="Saldo após resgate"
                      value={`${(
                        paciente.pontos - brindeSelecionado.pontos
                      ).toLocaleString("pt-BR")} pts`}
                    />
                  </div>
                </div>

                <button
                  onClick={confirmarResgate}
                  disabled={
                    brindeSelecionado.estoque <= 0 ||
                    paciente.pontos < brindeSelecionado.pontos
                  }
                  className={`mt-6 w-full py-4 rounded-2xl font-black transition ${
                    brindeSelecionado.estoque <= 0 ||
                    paciente.pontos < brindeSelecionado.pontos
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#4c9a2a] hover:bg-[#3c7d21] text-white shadow"
                  }`}
                >
                  {brindeSelecionado.estoque <= 0
                    ? "Brinde esgotado"
                    : paciente.pontos < brindeSelecionado.pontos
                    ? "Pontos insuficientes"
                    : "Confirmar resgate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#071d3a] text-white px-5 py-3 rounded-2xl shadow-2xl z-50 font-bold flex items-center gap-2">
          <CheckCircle size={18} className="text-[#9ac84b]" />
          {toast}
        </div>
      )}
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f7fafc] rounded-3xl p-5 border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-black text-[#071d3a] mt-1">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="bg-[#f7fafc] rounded-2xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}

function Linha({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-[#f7fafc] rounded-2xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

function Resumo({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <strong className={danger ? "text-red-500" : "text-[#4c9a2a]"}>
        {value}
      </strong>
    </div>
  );
}