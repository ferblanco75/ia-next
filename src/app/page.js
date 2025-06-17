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
  const [serviceUsed, setServiceUsed] = useState("");
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
    setServiceUsed("");

    try {
      const token = localStorage.getItem("token");
      console.log("🚀 Enviando pregunta:", prompt.substring(0, 50) + "...");
      
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
      console.log("📡 Respuesta recibida:", data);
      
      setResponse(data.response);
      setServiceUsed(data.serviceUsed || "Desconocido");
      
      // Mostrar información del servicio usado
      if (data.serviceUsed) {
        console.log(`🎉 Servicio usado: ${data.serviceUsed}`);
        setDebugInfo(`Respuesta generada por: ${data.serviceUsed}`);
      }
      
    } catch (error) {
      console.error("💥 Error en handleSubmit:", error);
      setResponse("Error de conexión.");
      setDebugInfo("Error al conectar con el servidor");
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
      <header className="bg-gray-800 shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700 space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-400">Mi IA Fácil</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <span className="text-gray-300 text-base sm:text-lg">
            Hola, {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors w-full sm:w-auto"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex flex-col flex-grow max-w-4xl lg:max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        <div className="space-y-6 lg:space-y-8">
          {/* Sección de entrada */}
          <section className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-blue-400">Escribe tu pregunta</h2>
            <textarea
              placeholder="Escribe tu pregunta aquí..."
              className="w-full p-4 sm:p-6 border border-gray-600 rounded-lg resize-none h-32 sm:h-40 lg:h-48 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <div className="mt-4 sm:mt-6 flex justify-center">
              <button
                className={`rounded-lg px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition-all duration-200 w-full sm:w-auto ${
                  loading 
                    ? "bg-gray-600 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Enviar Pregunta"}
              </button>
            </div>
          </section>

          {/* Sección de respuesta */}
          <section className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-700 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-blue-400">
              Respuesta de la IA:
              {serviceUsed && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  (via {serviceUsed})
                </span>
              )}
            </h2>
            <div className="bg-gray-700 rounded-lg p-4 sm:p-6 min-h-[150px] sm:min-h-[180px] lg:min-h-[200px]">
              <p className="text-gray-200 leading-relaxed text-base sm:text-lg">
                {response || "Aquí aparecerá la respuesta de la IA..."}
              </p>
            </div>
            
            {/* Información de debug */}
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-600 rounded-lg text-sm">
                <span className="text-gray-300">Debug: {debugInfo}</span>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="bg-gray-800 text-center py-4 sm:py-6 text-sm sm:text-base text-gray-400 border-t border-gray-700">
        © 2025 Mi IA Fácil - Desarrollado con Next.js y IA Gratuita
      </footer>
    </div>
  );
}
