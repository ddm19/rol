import { supabase } from "./supabaseClient"

export type Container = { id: string; name: string; description?: string | null }

export async function createContainer(input: { name: string; description?: string }) {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error("No session")
  const { data, error } = await supabase
    .from("sheets_containers")
    .insert({ owner: user.id, name: input.name, description: input.description ?? null })
    .select("*")
    .single()
  if (error) throw error
  return data as Container
}

export async function listMyContainers() {
  const { data, error } = await supabase.from("sheets_containers").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Container[]
}