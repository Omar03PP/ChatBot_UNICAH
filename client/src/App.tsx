import { useMemo, useState } from "react";
import "./App.css";

type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola Soy tu chatbot. ¿Qué quieres preguntar?" },
  ]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const canSend = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

  const send = async () => {
    if (!canSend) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const next: ChatMessage[] = [...messages, userMsg];

    setMessages(next);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data: ChatResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error desconocido");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "" }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ ${e?.message ?? "Error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <header className="header">
          <div>
            <h1>ChatBot UNICAH</h1>
            <p>Clase:Negocios Web</p>
          </div>
          <span className={`pill ${loading ? "pill-on" : ""}`}>
            {loading ? "Pensando..." : "Listo"}
          </span>
        </header>

        <div className="chat">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === "user" ? "user" : "bot"}`}>
              {m.content}
            </div>
          ))}
        </div>

        <footer className="footer">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu mensaje…"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />
          <button onClick={send} disabled={!canSend}>
            Enviar
          </button>
        </footer>
      </div>
    </div>
  );
}