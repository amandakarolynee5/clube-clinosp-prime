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

export async function createBrinde(
  brinde: Omit<Brinde, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("brindes")
    .insert([brinde])
    .select()
    .single();

  if (error) throw error;

  return data as Brinde;
}

export async function updateBrinde(
  id: string,
  brinde: Partial<Omit<Brinde, "id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("brindes")
    .update(brinde)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as Brinde;
}

export async function deleteBrinde(id: string) {
  const { error } = await supabase.from("brindes").delete().eq("id", id);

  if (error) throw error;

  return true;
}

/* Compatibilidade com nomes antigos */
export const criarBrinde = createBrinde;
export const atualizacaoBrinde = updateBrinde;
export const atualizaçãoBrinde = updateBrinde;
export const excluirBrinde = deleteBrinde;