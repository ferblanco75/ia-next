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
      const res = await fetch("/api/chat", {
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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg p-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Mi IA Fácil</h1>
      </header>

      <main className="flex flex-col flex-grow max-w-3xl mx-auto p-6">
        <textarea
          placeholder="Escribe tu pregunta aquí..."
          className="w-full p-4 border border-gray-600 rounded-md resize-none h-32 mb-4 focus:outline-blue-500 bg-gray-800 text-white placeholder-gray-400"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button
          className={`rounded-md px-6 py-3 text-white font-medium ${
            loading 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          } transition-colors duration-200`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Enviar"}
        </button>

        <section className="mt-8 bg-gray-800 p-6 rounded-md shadow-lg border border-gray-700 min-h-[150px]">
          <h2 className="font-semibold mb-2 text-blue-400">Respuesta de la IA:</h2>
          <p className="text-gray-200 leading-relaxed">
            {response || "Aquí aparecerá la respuesta..."}
          </p>
        </section>
      </main>

      <footer className="bg-gray-800 text-center py-4 text-sm text-gray-400 border-t border-gray-700">
        © 2025 Mi IA Fácil
      </footer>
    </div>
  );
}
