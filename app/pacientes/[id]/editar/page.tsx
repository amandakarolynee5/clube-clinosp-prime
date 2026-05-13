"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function EditarPacientePage() {
  const { id } = useParams();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [pontos, setPontos] = useState(0);
  const [nivel, setNivel] = useState("Bronze");
  const [status, setStatus] = useState("Ativo");

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPaciente();
  }, []);

  async function carregarPaciente() {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Paciente não encontrado");
      return;
    }

    setNome(data.nome || "");
    setTelefone(data.telefone || "");
    setCpf(data.cpf || "");
    setPontos(data.pontos || 0);
    setNivel(data.nivel || "Bronze");
    setStatus(data.status || "Ativo");
  }

  async function salvarPaciente() {
    try {
      setSalvando(true);

      const { error } = await supabase
        .from("pacientes")
        .update({
          nome,
          telefone,
          cpf,
          pontos,
          nivel,
          status,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Paciente atualizado com sucesso!");

      router.push("/pacientes");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar paciente");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef4fa] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl p-8">
        <h1 className="text-4xl font-black text-[#071d3a] mb-2">
          Editar Paciente
        </h1>

        <p className="text-gray-500 mb-8">
          Atualize os dados do paciente.
        </p>

        <div className="space-y-5">
          <div>
            <label className="font-bold text-sm text-[#071d3a]">
              Nome
            </label>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-sm text-[#071d3a]">
              Telefone
            </label>

            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-sm text-[#071d3a]">
              CPF
            </label>

            <input
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-sm text-[#071d3a]">
              Pontos
            </label>

            <input
              type="number"
              value={pontos}
              onChange={(e) => setPontos(Number(e.target.value))}
              className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-sm text-[#071d3a]">
              Nível
            </label>

            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none"
            >
              <option>Bronze</option>
              <option>Prata</option>
              <option>Ouro</option>
              <option>Platina</option>
              <option>Diamante</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-sm text-[#071d3a]">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none"
            >
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>

          <button
            onClick={salvarPaciente}
            disabled={salvando}
            className="w-full bg-gradient-to-r from-[#174f8c] to-[#4c9a2a] text-white py-4 rounded-2xl font-black shadow-xl hover:scale-[1.01] transition"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}