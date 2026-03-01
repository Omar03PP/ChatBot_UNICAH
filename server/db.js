import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const db = await open({
  filename: "./chat_history.db",
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS chat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL
  )
`);