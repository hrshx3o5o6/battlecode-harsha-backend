import { supabase }  from "../lib/supabaseClient.js";

export function generateUniqueRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getRandomQuestion(language_id, difficulty) {
  const { data, error } = await supabase
    .from("long_questions_python") // Adjust table name based on language
    .select("*")
    .eq("language_id", language_id)
    .eq("difficulty", difficulty);
console.log("Fetching question with language_id:", language_id, "and difficulty:", difficulty);
  console.log("Supabase query result:", data, error);
  if (error) {
    console.error("Error fetching question:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}