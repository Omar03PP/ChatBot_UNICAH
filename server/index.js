import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { db } from "./db.js";
import { Messages } from "openai/resources/chat/completions.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;



        //Validacion
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "La variables debe ser un arreglo con al menos un mensaje",
            });
        }

        const safeMessage = messages
            .filter(
                (m) => m && typeof m.content === "string" && typeof m.role === "string",
            )
            .slice(-20) // para limitar el historial
            .map(m => ({ role: m.role, content: m.content }));

        const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content: "Eres un agente amable y claro. Responde en español latino.",
                },
                ...safeMessage,
            ],
        });

        const reply = response.output_text;

        const now = new Date();
        const fecha = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const hora = now.toTimeString().split(" ")[0]; // HH:MM:SS

        const userQuestion = safeMessage[safeMessage.length - 1]?.content || "";

        await db.run(
            `INSERT INTO chat_logs (fecha, hora, pregunta, respuesta)
   VALUES (?, ?, ?, ?)`,
            [fecha, hora, userQuestion, reply]
        );


        return res.json({
            reply: response.output_text
        });
    } catch (error) {
        console.error(`Error en la petición: ${error}`);
        //Mensaje de error

        return res.status(500).json({
            error: `Error en la llamada de la API. ${error.message}`,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend corriendo en el puerto: ${PORT}`);
});
