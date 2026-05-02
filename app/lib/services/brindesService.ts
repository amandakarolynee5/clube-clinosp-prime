import { supabase } from "../supabase";

export type Brinde = {
  id: string;
  nome: string;
  pontos: number;
  estoque: number;
  imagem?: string | null;
  descricao?: string | null;
  especificacoes?: string | null;
  created_at?: string;
};

export async function getBrindes() {
  const { data, error } = await supabase
    .from("brindes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []) as Brinde[];
}

export async function criarBrinde(brinde: Omit<Brinde, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("brindes")
    .insert([brinde])
    .select();

  if (error) throw error;

  return data;
}

export async function atualizarBrinde(
  id: string,
  brinde: Partial<Omit<Brinde, "id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("brindes")
    .update(brinde)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}

export async function deletarBrinde(id: string) {
  const { error } = await supabase.from("brindes").delete().eq("id", id);

  if (error) throw error;
}

// compatibilidade com nomes em inglês, caso alguma página use
export const createBrinde = criarBrinde;
export const updateBrinde = atualizarBrinde;
export const deleteBrinde = deletarBrinde;