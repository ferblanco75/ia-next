"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const text = await res.text(); // para ver la respuesta cruda
        throw new Error(`Error del servidor: ${res.status} - ${text}`);
      }
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setResponse("Error: " + (data.error || "Error desconocido"));
      }
    } catch {
      setResponse("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Mi IA Fácil</h1>
      </header>

      <main className="flex flex-col flex-grow max-w-3xl mx-auto p-6">
        <textarea
          placeholder="Escribe tu pregunta aquí..."
          className="w-full p-4 border rounded-md resize-none h-32 mb-4 focus:outline-blue-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button
          className={`rounded-md px-6 py-3 text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } transition`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Enviar"}
        </button>

        <section className="mt-8 bg-white p-6 rounded-md shadow min-h-[150px]">
          <h2 className="font-semibold mb-2">Respuesta de la IA:</h2>
          <p>{response || "Aquí aparecerá la respuesta..."}</p>
        </section>
      </main>

      <footer className="bg-white text-center py-4 text-sm text-gray-500">
        © 2025 Mi IA Fácil
      </footer>
    </div>
  );
}
