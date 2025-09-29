import { supabase } from "./supabaseClient"

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw error || new Error('No session')
  return data.user
}

export async function getMyProfile() {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  if (!data) {
    const { data: inserted, error: upsertErr } = await supabase
      .from('profiles')
      .upsert({ id: user.id })
      .select('*')
      .single()
    if (upsertErr) throw upsertErr
    return inserted
  }
  return data
}

export async function saveMyProfile(input: { username?: string; avatar_key?: string }) {
  const user = await getCurrentUser()
  const payload = { id: user.id, ...input, updated_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function isVillazarcilloPlayer() {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('villazarcillo_players')
    .select()
    .eq('player', user.id)
    .single()
  if (error && error.code !== 'PGRST116') throw error // Empty error code
  return !!data
}