import { supabase } from "./supabaseClient"

export type Sheet = { id: string; container_id: string; name: string; data: any; updated_at: string }

export async function createSheet(input: { container_id: string; name: string; data?: any }) {
  const { data, error } = await supabase
    .from("sheets")
    .insert({ container_id: input.container_id, name: input.name, data: input.data ?? {} })
    .select("*")
    .single()
  if (error) throw error
  return data as Sheet
}

export async function listSheets(container_id: string) {
  const { data, error } = await supabase
    .from("sheets")
    .select("*")
    .eq("container_id", container_id)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Sheet[]
}

export async function getSheet(id: string) {
  const { data, error } = await supabase.from("sheets").select("*").eq("id", id).single()
  if (error) throw error
  return data as Sheet
}

export async function patchSheet(id: string, partial: { name?: string; data?: any }) {
  const { data, error } = await supabase.from("sheets").update({ ...partial, updated_at: new Date().toISOString() }).eq("id", id).select("*").single()
  if (error) throw error
  return data as Sheet
}