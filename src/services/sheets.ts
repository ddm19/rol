import { supabase } from "./supabaseClient"
import axios from "axios";

export type Sheet = { id: string; owner: string; content: any; updated_at: string }

export async function listMySheets(): Promise<Sheet[]> {
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

const KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const OR = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: KEY ? `Bearer ${KEY}` : undefined,
    "Content-Type": "application/json",
    "HTTP-Referer": location.origin,
    "X-Title": "HispaniaPage",
  },
  timeout: 30000
});

function stripThinkSafe(s: string) {
  const hasOpen = s.includes("<think>");
  const hasClose = s.includes("</think>");
  if (hasOpen && hasClose) return s.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return s.trim();
}

function extractMarkdown(s: string) {
  const m = s.match(/```(?:markdown)?\s*([\s\S]*?)```/i);
  if (m) return m[1].trim();
  return s.trim();
}

export async function beautifyInventoryMarkdown(raw: string) {
  if (!KEY) {
    console.error("OpenRouter API key vacía en el cliente (revisa env + rebuild con cache limpia en Vercel).");
    throw new Error("OpenRouter API key vacía en el cliente (revisa env + rebuild con cache limpia en Vercel).");
  }
  const model = "tngtech/deepseek-r1t-chimera:free";
  const userPrompt = `Convierte este inventario de D&D a Markdown perfectamente estructurado:
- Encabezados (pequeños) para secciones (Armas, Armaduras, Consumibles, Misceláneo)
- Listas con viñetas para ítems
- Tablas Markdown si hay cantidades o propiedades
- Sin explicación ni texto extra. Devuelve únicamente el Markdown final.
- Debe contener todos los ítems del inventario original, sin omitir ni añadir nada.

Texto:
${raw}`;
  const r = await OR.post("/chat/completions", {
    model,
    messages: [
      { role: "system", content: "Eres un formateador que devuelve exclusivamente Markdown válido para fichas de D&D." },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 1200
  });
  const out = r.data?.choices?.[0]?.message?.content ?? "";
  return extractMarkdown(stripThinkSafe(out));
}