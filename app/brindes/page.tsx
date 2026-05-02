"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  ImagePlus,
  X,
  Gift,
  Sparkles,
  Package,
  Search,
  Info,
} from "lucide-react";

import {
  getBrindes,
  createBrinde,
  updateBrinde,
  deleteBrinde,
} from "../lib/services/brindesService";

type Brinde = {
  id: string;
  nome: string;
  pontos: number;
  estoque: number;
  imagem?: string | null;
  descricao?: string | null;
  especificacoes?: string | null;
  created_at?: string;
};

export default function BrindesPage() {
  const [brindes, setBrindes] = useState<Brinde[]>([]);
  const [nome, setNome] = useState("");
  const [pontos, setPontos] = useState("");
  const [estoque, setEstoque] = useState("");
  const [descricao, setDescricao] = useState("");
  const [especificacoes, setEspecificacoes] = useState("");
  const [imagem, setImagem] = useState("");
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<Brinde | null>(null);
  const [toast, setToast] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    buscarBrindes();
  }, []);

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function buscarBrindes() {
    try {
      setCarregando(true);
      const data = await getBrindes();
      setBrindes((data || []) as Brinde[]);
    } catch (error) {
      mostrarToast("Erro ao buscar brindes");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagem(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function salvar() {
    if (!nome.trim() || !pontos || !estoque) {
      mostrarToast("Preencha nome, pontos e estoque");
      return;
    }

    const dadosBrinde = {
      nome: nome.trim(),
      pontos: Number(pontos),
      estoque: Number(estoque),
      imagem: imagem || null,
      descricao: descricao.trim() || null,
      especificacoes: especificacoes.trim() || null,
    };

    try {
      if (editandoId) {
        await updateBrinde(editandoId, dadosBrinde);
        mostrarToast("Brinde atualizado!");
      } else {
        await createBrinde(dadosBrinde);
        mostrarToast("Brinde cadastrado!");
      }

      limpar();
      buscarBrindes();
    } catch (error) {
      mostrarToast("Erro ao salvar brinde");
      console.error(error);
    }
  }

  function limpar() {
    setNome("");
    setPontos("");
    setEstoque("");
    setDescricao("");
    setEspecificacoes("");
    setImagem("");
    setEditandoId(null);
  }

  function editar(b: Brinde) {
    setNome(b.nome);
    setPontos(String(b.pontos));
    setEstoque(String(b.estoque));
    setDescricao(b.descricao || "");
    setEspecificacoes(b.especificacoes || "");
    setImagem(b.imagem || "");
    setEditandoId(b.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluir(id: string) {
    const confirmar = confirm("Deseja excluir este brinde?");
    if (!confirmar) return;

    try {
      await deleteBrinde(id);
      mostrarToast("Brinde excluido!");
      buscarBrindes();
    } catch (error) {
      mostrarToast("Erro ao excluir brinde");
      console.error(error);
    }
  }

  const brindesFiltrados = brindes.filter((b) =>
    b.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalBrindes = brindes.length;
  const brindesDisponiveis = brindes.filter((b) => b.estoque > 0).length;
  const estoqueTotal = brindes.reduce((acc, b) => acc + (b.estoque || 0), 0);

  return (
    <main className="min-h-screen bg-[#eef4fa] p-8 text-[#071d3a]">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071d3a] via-[#174f8c] to-[#4c9a2a] p-8 lg:p-10 text-white shadow-2xl mb-8">
        <div className="absolute right-[-80px] top-[-80px] w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-[35%] bottom-[-130px] w-96 h-96 rounded-full bg-[#9ac84b]/20 blur-3xl" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-5">
            <Sparkles size={16} />
            Loja premium de recompensas
          </span>

          <h1 className="text-4xl lg:text-6xl font-black leading-tight">
            Loja de Brindes
          </h1>

          <p className="text-white/80 mt-4 text-lg max-w-2xl">
            Cadastre recompensas, controle estoque e apresente os brindes como
            um catálogo premium do Clube Clinosp Prime.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <CardResumo
          titulo="Brindes cadastrados"
          valor={totalBrindes.toString()}
          descricao="Itens na loja"
          icone={<Gift />}
          cor="azul"
        />

        <CardResumo
          titulo="Disponíveis"
          valor={brindesDisponiveis.toString()}
          descricao="Com estoque ativo"
          icone={<Package />}
          cor="verde"
        />

        <CardResumo
          titulo="Estoque total"
          valor={estoqueTotal.toString()}
          descricao="Unidades disponíveis"
          icone={<Sparkles />}
          cor="escuro"
        />
      </section>

      <section className="bg-white rounded-[2rem] shadow p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#eaf3e5] flex items-center justify-center">
            <ImagePlus className="text-[#4c9a2a]" />
          </div>

          <div>
            <h2 className="text-2xl font-black">
              {editandoId ? "Editar brinde" : "Cadastrar novo brinde"}
            </h2>
            <p className="text-sm text-gray-500">
              Adicione nome, imagem, pontos, estoque e especificações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Campo
            label="Nome do brinde"
            value={nome}
            onChange={setNome}
            placeholder="Ex: Caneca personalizada"
          />

          <Campo
            label="Pontos"
            value={pontos}
            onChange={setPontos}
            placeholder="Ex: 250"
            type="number"
          />

          <Campo
            label="Estoque"
            value={estoque}
            onChange={setEstoque}
            placeholder="Ex: 10"
            type="number"
          />

          <div className="lg:col-span-3">
            <label className="font-bold">Descrição curta</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Caneca personalizada exclusiva Clinosp Prime"
              className="mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#174f8c]/20"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="font-bold">Especificações do brinde</label>
            <textarea
              value={especificacoes}
              onChange={(e) => setEspecificacoes(e.target.value)}
              placeholder={`Ex:
Material: cerâmica
Capacidade: 325ml
Cor: branca
Personalização: logo Clinosp Prime`}
              className="mt-2 w-full min-h-32 border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#174f8c]/20 resize-none"
            />
          </div>

          <div>
            <label className="font-bold">Imagem do brinde</label>
            <label className="mt-2 h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-[#f7fafc] transition">
              <ImagePlus className="text-[#174f8c]" />
              <span className="text-sm font-bold text-[#174f8c]">
                Selecionar imagem
              </span>
              <input type="file" hidden accept="image/*" onChange={handleImagem} />
            </label>
          </div>
        </div>

        {imagem && (
          <div className="mt-5 bg-[#f7fafc] rounded-3xl p-4 flex items-center gap-4">
            <img
              src={imagem}
              alt="Prévia"
              className="w-24 h-24 rounded-2xl object-cover"
            />
            <div>
              <p className="font-black">Prévia da imagem</p>
              <p className="text-sm text-gray-500">
                Essa imagem será exibida no catálogo.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {editandoId && (
            <button
              onClick={limpar}
              className="bg-[#f3f7fb] text-[#174f8c] px-5 py-4 rounded-2xl font-black"
            >
              Cancelar edição
            </button>
          )}

          <button
            onClick={salvar}
            className={`${
              editandoId ? "" : "md:col-span-2"
            } bg-[#174f8c] hover:bg-[#123d6e] text-white px-5 py-4 rounded-2xl font-black shadow transition`}
          >
            {editandoId ? "Salvar alterações" : "Cadastrar brinde"}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black">Catálogo de brindes</h2>
            <p className="text-sm text-gray-500">
              Visual premium dos itens disponíveis para resgate.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar brinde..."
              className="w-full border rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#174f8c]/20"
            />
          </div>
        </div>

        {carregando ? (
          <p className="font-bold text-[#174f8c]">Carregando brindes...</p>
        ) : brindesFiltrados.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-gray-500 font-bold">
              Nenhum brinde encontrado.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {brindesFiltrados.map((b) => {
              const esgotado = b.estoque <= 0;

              return (
                <div
                  key={b.id}
                  className="group bg-white rounded-[2rem] border border-gray-100 shadow hover:shadow-2xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="relative h-60 bg-[#f3f7fb] overflow-hidden">
                    {b.imagem ? (
                      <img
                        src={b.imagem}
                        alt={b.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem imagem
                      </div>
                    )}

                    <div className="absolute top-4 right-4 bg-white/95 shadow px-4 py-2 rounded-full font-black text-[#174f8c]">
                      {b.pontos} pts
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
                    <h2 className="font-black text-xl">{b.nome}</h2>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {b.descricao || "Sem descrição cadastrada."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <InfoMini label="Estoque" value={b.estoque} />
                      <InfoMini label="Pontos" value={`${b.pontos} pts`} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <button
                        onClick={() => editar(b)}
                        className="bg-[#174f8c] text-white px-3 py-3 rounded-2xl flex justify-center hover:scale-105 transition"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => excluir(b.id)}
                        className="bg-red-500 text-white px-3 py-3 rounded-2xl flex justify-center hover:scale-105 transition"
                      >
                        <Trash2 size={17} />
                      </button>

                      <button
                        onClick={() => setDetalhe(b)}
                        className="bg-[#071d3a] text-white px-3 py-3 rounded-2xl flex justify-center hover:scale-105 transition"
                      >
                        <Eye size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </section>

      {detalhe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden relative">
            <button
              onClick={() => setDetalhe(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full shadow"
            >
              <X />
            </button>

            {detalhe.imagem ? (
              <img
                src={detalhe.imagem}
                alt={detalhe.nome}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="w-full h-80 bg-[#f3f7fb] flex items-center justify-center text-gray-400">
                Sem imagem
              </div>
            )}

            <div className="p-7">
              <span className="inline-flex items-center gap-2 bg-[#eaf3e5] text-[#4c9a2a] px-4 py-2 rounded-full font-black text-sm mb-4">
                <Info size={16} />
                Especificações do brinde
              </span>

              <h2 className="text-3xl font-black">{detalhe.nome}</h2>

              <p className="text-gray-500 mt-3">
                {detalhe.descricao || "Sem descrição cadastrada."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Linha label="Pontos necessários" value={`${detalhe.pontos} pts`} />
                <Linha label="Estoque disponível" value={detalhe.estoque} />
              </div>

              <div className="mt-6 bg-[#f7fafc] rounded-3xl p-5">
                <h3 className="font-black mb-3">Detalhes e especificações</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {detalhe.especificacoes || "Nenhuma especificação cadastrada."}
                </p>
              </div>

              <button
                onClick={() => setDetalhe(null)}
                className="mt-6 w-full bg-[#174f8c] text-white py-4 rounded-2xl font-black"
              >
                Fechar detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#071d3a] text-white px-5 py-3 rounded-2xl shadow-2xl z-50 font-bold">
          {toast}
        </div>
      )}
    </main>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#174f8c]/20"
      />
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#f7fafc] rounded-2xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-black text-[#071d3a]">{value}</p>
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
    <div className="flex justify-between bg-[#f7fafc] p-4 rounded-2xl">
      <span className="text-gray-500">{label}</span>
      <strong>{value}</strong>
    </div>
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
  icone: React.ReactNode;
  cor: "azul" | "verde" | "escuro";
}) {
  const cores = {
    azul: "from-[#174f8c] to-[#071d3a]",
    verde: "from-[#4c9a2a] to-[#2f6818]",
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