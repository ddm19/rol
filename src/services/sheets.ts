import { supabase } from "./supabaseClient"

export type Sheet = { id: string; owner: string; content: any; updated_at: string }

export async function listMySheets(): Promise<Sheet[]> {
  debugger
  const { data, error } = await supabase
    .from("sheets")
    .select("id, owner, content, updated_at")
    .eq("deleted", false)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getSheet(id: string): Promise<Sheet> {
  const { data, error } = await supabase
    .from("sheets")
    .select("id, owner, content, updated_at")
    .eq("id", id).eq("deleted", false)
    .single()
  if (error) throw error
  return data
}

export async function upsertSheet(id: string, content: any): Promise<Sheet> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error("No session")
  const payload = { id, owner: user.id, content, updated_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from("sheets")
    .upsert(payload, { onConflict: "id, owner" })
    .select("id, owner, content, updated_at")
    .single()
  if (error) throw error
  return data
}

export async function createSheetWithId(id: string, content: any = {}): Promise<Sheet> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("No session");
  const { data, error } = await supabase
    .from("sheets")
    .insert({ id, owner: user.id, content, updated_at: new Date().toISOString() })
    .select("id, owner, content, updated_at")
    .single();
  if (error) throw error;           
  return data as Sheet;
}

export async function deleteSheet(id: string): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("No session");
  const { error } = await supabase
    .from("sheets")
    .upsert({ id, owner: user.id, deleted: true, updated_at: new Date().toISOString() }, { onConflict: "id, owner" });
  if (error) throw error;
}