import express from "express";
import { supabase }  from "../lib/supabaseClient.js";
import { generateUniqueRoomCode, getRandomQuestion } from "../lib/roomUtils.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Received request to create room:", req.body);
    const { language, difficulty, duration } = req.body;

    if (!language || !difficulty || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const language_id_map = {
      python: 71,
      javascript: 63,
      java: 62,
      cpp: 54,
      csharp: 51,
      go: 60,
    };

    const language_id = language_id_map[language];
    if (!language_id) {
      return res.status(400).json({ error: "Invalid language" });
    }

    const room_code = generateUniqueRoomCode();

    const question = await getRandomQuestion(language_id, difficulty);
    if (!question) {
      return res.status(404).json({ error: "No question found" });
    }

    const { error: insertError } = await supabase.from("rooms").insert({
      code: room_code,
      language_id,
      difficulty,
      time_limit: parseInt(duration),
      question_id: question.id,
    });

    if (insertError) {
      console.error("Room insert error:", insertError);
      return res.status(500).json({ error: "Failed to insert room" });
    }

    res.json({ room_code });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;