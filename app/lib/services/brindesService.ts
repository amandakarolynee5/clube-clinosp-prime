import { supabase } from "../supabase";

export async function getBrindes() {
  const { data, error } = await supabase
    .from("brindes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createBrinde(brinde: any) {
  const { error } = await supabase
    .from("brindes")
    .insert([brinde]);

  if (error) throw error;
}

export async function updateBrinde(id: string, brinde: any) {
  const { error } = await supabase
    .from("brindes")
    .update(brinde)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteBrinde(id: string) {
  const { error } = await supabase
    .from("brindes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}