import { supabase } from "../supabase";

export type Paciente = {
  id: string;
  nome: string;
  telefone: string;
  cpf?: string;
  pontos: number;
  nivel: string;
  status: string;
  created_at?: string;
};

function calcularNivel(pontos: number) {
  if (pontos >= 8000) return "Diamante";
  if (pontos >= 5000) return "Platina";
  if (pontos >= 2500) return "Ouro";
  if (pontos >= 1000) return "Prata";
  return "Bronze";
}

export async function getPacientes() {
  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;

  return (data || []) as Paciente[];
}

export async function adicionarPontosPaciente(
  paciente: Paciente,
  pontos: number,
  tipo: string
) {
  const novosPontos = (paciente.pontos || 0) + pontos;
  const novoNivel = calcularNivel(novosPontos);

  const { error: erroPaciente } = await supabase
    .from("pacientes")
    .update({
      pontos: novosPontos,
      nivel: novoNivel,
    })
    .eq("id", paciente.id);

  if (erroPaciente) throw erroPaciente;

  const { error: erroMovimentacao } = await supabase
    .from("movimentacoes")
    .insert([
      {
        paciente_id: paciente.id,
        tipo,
        descricao: `Pontuação adicionada: ${tipo}`,
        pontos,
      },
    ]);

  if (erroMovimentacao) throw erroMovimentacao;
}