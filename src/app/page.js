"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    console.log("🔍 Checking authentication...");
    console.log("Token exists:", !!token);
    console.log("User data exists:", !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("✅ User data parsed:", parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setDebugInfo("Usuario autenticado correctamente");
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
        setDebugInfo("Error al parsear datos del usuario");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    } else {
      console.log("❌ No authentication data found, redirecting to login");
      setDebugInfo("No hay datos de autenticación, redirigiendo al login");
      // Si no está autenticado, redirigir al login
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  async function handleSubmit() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          // Token expirado o inválido
          handleLogout();
          return;
        }
        const text = await res.text();
        throw new Error(`Error del servidor: ${res.status} - ${text}`);
      }
      
      const data = await res.json();
        setResponse(data.response);
    } catch (error) {
      setResponse("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  // Si no está autenticado, mostrar loading
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg p-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Mi IA Fácil</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            Hola, {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
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
