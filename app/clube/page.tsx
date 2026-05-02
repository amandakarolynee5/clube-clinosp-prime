"use client";

import Image from "next/image";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Gift,
  Phone,
  Star,
  Trophy,
  Sparkles,
  X,
  Info,
  CheckCircle,
  History,
  LogOut,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

const LOGO = "/logo-clinosp.png";

type Paciente = {
  id: string;
  nome: string;
  telefone: string;
  pontos: number;
  nivel: string;
};

type Brinde = {
  id: string;
  nome: string;
  pontos: number;
  estoque: number;
  imagem?: string | null;
  descricao?: string | null;
  especificacoes?: string | null;
};

type Resgate = {
  id: string;
  pontos_usados: number;
  status: string;
  created_at: string;
  brindes: {
    nome: string;
  }[] | null;
};

type Movimentacao = {
  id: string;
  tipo: string;
  descricao?: string | null;
  pontos: number;
  created_at: string;
};

export default function ClubePage() {
  const [telefone, setTelefone] = useState("");
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [brindeSelecionado, setBrindeSelecionado] = useState<Brinde | null>(
    null
  );
  const [carregando, setCarregando] = useState(false);
  const [toast, setToast] = useState("");
  const [erro, setErro] = useState("");

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function limparTelefone(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function atualizarNivel(pontos: number) {
    if (pontos >= 8000) return "Diamante";
    if (pontos >= 5000) return "Platina";
    if (pontos >= 2500) return "Ouro";
    if (pontos >= 1000) return "Prata";
    return "Bronze";
  }

  async function carregarAreaPaciente(pacienteEncontrado: Paciente) {
    const { data: brindesData } = await supabase
      .from("brindes")
      .select("*")
      .order("pontos", { ascending: true });

    const { data: resgatesData } = await supabase
      .from("resgates")
      .select(
        `
        id,
        pontos_usados,
        status,
        created_at,
        brindes(nome)
      `
      )
      .eq("paciente_id", pacienteEncontrado.id)
      .order("created_at", { ascending: false });

    const { data: movimentacoesData } = await supabase
      .from("movimentacoes")
      .select("*")
      .eq("paciente_id", pacienteEncontrado.id)
      .order("created_at", { ascending: false });

    setBrindes(brindesData || []);
    setResgates((resgatesData as unknown as Resgate[]) || []);
    setMovimentacoes((movimentacoesData as Movimentacao[]) || []);
  }

  async function acessarClube() {
    setErro("");

    if (!telefone.trim()) {
      setErro("Digite seu telefone para acessar.");
      return;
    }

    setCarregando(true);

    const telefoneDigitado = limparTelefone(telefone);

    const { data: pacientesData, error } = await supabase
      .from("pacientes")
      .select("*");

    if (error) {
      setErro("Erro ao buscar paciente.");
      setCarregando(false);
      return;
    }

    const encontrado = pacientesData?.find(
      (p: Paciente) => limparTelefone(p.telefone || "") === telefoneDigitado
    );

    if (!encontrado) {
      setErro("Paciente não encontrado. Verifique o telefone cadastrado.");
      setCarregando(false);
      return;
    }

    setPaciente(encontrado);
    await carregarAreaPaciente(encontrado);
    setCarregando(false);
  }

  async function confirmarResgate() {
    if (!paciente || !brindeSelecionado) return;

    if (brindeSelecionado.estoque <= 0) {
      mostrarToast("Este brinde está esgotado.");
      return;
    }

    if (paciente.pontos < brindeSelecionado.pontos) {
      mostrarToast("Você ainda não tem pontos suficientes.");
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
      mostrarToast("Erro ao atualizar seus pontos.");
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
      mostrarToast("Erro ao solicitar resgate.");
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

    const pacienteAtualizado = {
      ...paciente,
      pontos: novosPontos,
      nivel: novoNivel,
    };

    setPaciente(pacienteAtualizado);
    setBrindeSelecionado(null);
    mostrarToast("Resgate solicitado com sucesso!");
    await carregarAreaPaciente(pacienteAtualizado);
  }

  function sairClube() {
    setPaciente(null);
    setTelefone("");
    setBrindes([]);
    setResgates([]);
    setMovimentacoes([]);
  }

  if (!paciente) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#edf4fb] via-white to-[#e5eff8] flex items-center justify-center px-4 py-10 text-[#071d3a]">
        <section className="relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full rounded-3xl bg-white shadow-2xl border border-white">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#4c9a2a]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#174f8c]/10 rounded-full blur-3xl" />

          <div className="relative hidden lg:flex flex-col justify-between p-12 min-h-[640px] bg-gradient-to-br from-[#071d3a] via-[#174f8c] to-[#4c9a2a] text-white overflow-hidden rounded-l-3xl">
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute right-[-120px] top-[-120px] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute left-[-120px] bottom-[-120px] w-96 h-96 bg-[#9ac84b]/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <Image
                src={LOGO}
                alt="Clinosp Prime"
                width={260}
                height={110}
                className="object-contain mb-12 drop-shadow-2xl w-auto h-auto opacity-95"
              />

              <span className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-sm font-bold shadow-sm">
                <Sparkles size={16} />
                Clube Clinosp Prime
              </span>

              <h1 className="text-5xl font-black mt-8 leading-tight max-w-xl">
                Recompensas exclusivas para o seu sorriso
              </h1>

              <p className="text-white/85 mt-6 text-lg leading-relaxed max-w-md">
                Consulte seus pontos, acompanhe seus resgates e escolha brindes
                especiais preparados para você.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4">
              <MiniPasso numero="01" texto="Acesse" />
              <MiniPasso numero="02" texto="Escolha" />
              <MiniPasso numero="03" texto="Resgate" />
            </div>
          </div>

          <div className="relative z-10 p-8 lg:p-14 flex flex-col justify-center bg-white rounded-r-3xl">
            <div className="flex justify-center mb-8">
              <Image
                src={LOGO}
                alt="Clinosp Prime"
                width={230}
                height={100}
                className="object-contain drop-shadow-sm w-auto h-auto"
              />
            </div>

            <div className="w-16 h-16 rounded-3xl bg-[#eaf3e5] flex items-center justify-center mb-7 shadow-inner">
              <Gift className="text-[#4c9a2a]" size={31} />
            </div>

            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Acessar meu clube
            </h2>

            <p className="text-gray-500 mt-4 max-w-md leading-relaxed">
              Digite seu telefone cadastrado para entrar na sua área exclusiva
              de pontos e recompensas.
            </p>

            <div className="mt-7">
              <label className="font-bold">Telefone</label>

              <div className="mt-2 flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-4 bg-white focus-within:ring-4 focus-within:ring-[#174f8c]/20 shadow-sm transition">
                <Phone size={18} className="text-gray-400" />

                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (94) 99999-0000"
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </div>

            {erro && (
              <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold border border-red-100">
                {erro}
              </div>
            )}

            <button
              onClick={acessarClube}
              disabled={carregando}
              className="mt-6 w-full bg-[#174f8c] hover:bg-[#123d6e] text-white py-4 rounded-2xl font-black shadow-xl transition disabled:opacity-60"
            >
              {carregando ? "Acessando..." : "Entrar no Clube"}
            </button>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Beneficio icon={<ShieldCheck size={17} />} texto="Acesso seguro" />
              <Beneficio icon={<Star size={17} />} texto="Pontos em tempo real" />
              <Beneficio icon={<Gift size={17} />} texto="Brindes exclusivos" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4fa] px-4 py-6 lg:px-10 lg:py-10 text-[#071d3a]">
      <div className="max-w-[1600px] mx-auto">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-7 lg:p-10 text-white shadow-2xl mb-8">
          <div className="absolute right-[-80px] top-[-80px] w-80 h-80 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <Image
                src={LOGO}
                alt="Clinosp Prime"
                width={230}
                height={100}
                className="object-contain mb-8 drop-shadow-2xl w-auto h-auto"
              />

              <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-5">
                <Sparkles size={16} />
                Área do paciente
              </span>

              <h1 className="text-4xl lg:text-6xl font-black tracking-tight">
                Olá, {paciente.nome}
              </h1>

              <p className="text-white/80 mt-4 text-lg">
                Bem-vindo ao seu Clube Clinosp Prime.
              </p>
            </div>

            <button
              onClick={sairClube}
              className="self-start lg:self-center flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 px-5 py-3 rounded-2xl font-bold text-sm transition"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-9">
          <CardResumo
            titulo="Meus pontos"
            valor={`${paciente.pontos.toLocaleString("pt-BR")} pts`}
            icone={<Star />}
          />

          <CardResumo titulo="Meu nível" valor={paciente.nivel} icone={<Trophy />} />

          <CardResumo
            titulo="Resgates"
            valor={resgates.length.toString()}
            icone={<Gift />}
          />
        </section>

        <section className="mb-10">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-2 text-[#4c9a2a] font-black mb-2">
                <ShoppingBag size={18} />
                Catálogo premium
              </span>

              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
                Loja de brindes
              </h2>

              <p className="text-gray-500 mt-1">
                Escolha o brinde que deseja resgatar com seus pontos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-7 items-stretch">
            {brindes.map((brinde) => {
              const esgotado = brinde.estoque <= 0;
              const semPontos = paciente.pontos < brinde.pontos;

              return (
                <div
                  key={brinde.id}
                  className="group h-full bg-white rounded-3xl shadow-xl border border-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col"
                >
                  <div className="relative h-72 bg-[#f3f7fb] overflow-hidden rounded-t-3xl">
                    {brinde.imagem ? (
                      <img
                        src={brinde.imagem}
                        alt={brinde.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem imagem
                      </div>
                    )}

                    <div className="absolute top-4 right-4 bg-white shadow px-4 py-2 rounded-full font-black text-[#174f8c]">
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

                  <div className="p-5 flex flex-col flex-1">
                    <div className="min-h-[90px]">
                      <h3 className="text-xl font-black leading-snug">
                        {brinde.nome}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {brinde.descricao ||
                          "Brinde exclusivo do Clube Clinosp Prime."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <MiniInfo label="Estoque" value={brinde.estoque} />
                      <MiniInfo label="Pontos" value={`${brinde.pontos} pts`} />
                    </div>

                    <div className="mt-auto pt-5">
                      <button
                        onClick={() => setBrindeSelecionado(brinde)}
                        className="w-full py-4 rounded-2xl font-black bg-[#174f8c] hover:bg-[#123d6e] text-white shadow-lg transition"
                      >
                        Ver detalhes
                      </button>

                      <div className="h-8 flex items-center justify-center">
                        {(esgotado || semPontos) && (
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            {esgotado
                              ? "Este brinde está esgotado."
                              : "Você ainda não tem pontos suficientes."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-black mb-5 flex items-center gap-2">
              <Gift className="text-[#4c9a2a]" />
              Meus resgates
            </h2>

            {resgates.length === 0 ? (
              <p className="text-gray-500">Você ainda não possui resgates.</p>
            ) : (
              <div className="space-y-4">
                {resgates.map((item) => (
                  <div key={item.id} className="bg-[#f7fafc] rounded-2xl p-4">
                    <p className="font-black">
                      {item.brindes?.[0]?.nome || "Brinde"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString("pt-BR")}
                    </p>

                    <p className="text-red-500 font-black mt-2">
                      -{item.pontos_usados} pts
                    </p>

                    <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-black mb-5 flex items-center gap-2">
              <History className="text-[#174f8c]" />
              Histórico de pontos
            </h2>

            {movimentacoes.length === 0 ? (
              <p className="text-gray-500">Nenhum histórico registrado.</p>
            ) : (
              <div className="space-y-4">
                {movimentacoes.map((item) => (
                  <div key={item.id} className="bg-[#f7fafc] rounded-2xl p-4">
                    <p className="font-black">{item.tipo}</p>

                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString("pt-BR")}
                    </p>

                    <p
                      className={`font-black mt-2 ${
                        item.pontos < 0 ? "text-red-500" : "text-[#4c9a2a]"
                      }`}
                    >
                      {item.pontos > 0 ? "+" : ""}
                      {item.pontos} pts
                    </p>

                    {item.descricao && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.descricao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {brindeSelecionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative">
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
                  <MiniInfo
                    label="Saldo atual"
                    value={`${paciente.pontos} pts`}
                  />
                  <MiniInfo
                    label="Pontos necessários"
                    value={`${brindeSelecionado.pontos} pts`}
                  />
                  <MiniInfo label="Estoque" value={brindeSelecionado.estoque} />
                  <MiniInfo
                    label="Saldo após resgate"
                    value={`${paciente.pontos - brindeSelecionado.pontos} pts`}
                  />
                </div>

                <div className="mt-6 bg-[#f7fafc] rounded-3xl p-5">
                  <h3 className="font-black mb-3">Especificações</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {brindeSelecionado.especificacoes ||
                      "Nenhuma especificação cadastrada."}
                  </p>
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
                    : "Solicitar resgate"}
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

function MiniPasso({ numero, texto }: { numero: string; texto: string }) {
  return (
    <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
      <strong>{numero}</strong>
      <p className="text-white/75 mt-1">{texto}</p>
    </div>
  );
}

function Beneficio({ icon, texto }: { icon: React.ReactNode; texto: string }) {
  return (
    <div className="bg-[#f7fafc] rounded-2xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-[#174f8c] min-h-[54px] text-center">
      {icon}
      {texto}
    </div>
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
    <div className="bg-white rounded-3xl shadow-xl p-6 min-h-[135px] flex items-center">
      <div className="flex justify-between items-center w-full">
        <div>
          <p className="text-gray-500">{titulo}</p>
          <h2 className="text-3xl font-black mt-3">{valor}</h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#eaf3e5] flex items-center justify-center text-[#4c9a2a] shrink-0">
          {icone}
        </div>
      </div>
    </div>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-[#f7fafc] rounded-2xl p-4 min-h-[76px] flex flex-col justify-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}