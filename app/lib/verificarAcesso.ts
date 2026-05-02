import { supabase } from "./supabase";

export async function verificarAcesso(tiposPermitidos: string[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { permitido: false, motivo: "sem_login" };
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (!perfil) {
    return { permitido: false, motivo: "sem_perfil" };
  }

  if (!tiposPermitidos.includes(perfil.tipo)) {
    return { permitido: false, motivo: "sem_permissao" };
  }

  return { permitido: true, motivo: null };
}