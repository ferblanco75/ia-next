"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    setDebugInfo({
      token: token ? "Present" : "Missing",
      tokenLength: token ? token.length : 0,
      user: user ? "Present" : "Missing",
      userData: user ? JSON.parse(user) : null,
      timestamp: new Date().toISOString()
    });
  }, []);

  const clearStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug - Estado de Autenticación</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">localStorage Status</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <button
            onClick={clearStorage}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded mr-4"
          >
            Limpiar localStorage
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Recargar página
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Enlaces útiles</h2>
          <div className="space-y-2">
            <a href="/" className="block text-blue-400 hover:text-blue-300">
              → Dashboard principal
            </a>
            <a href="/login" className="block text-blue-400 hover:text-blue-300">
              → Página de login
            </a>
            <a href="/register" className="block text-blue-400 hover:text-blue-300">
              → Página de registro
            </a>
            <a href="/api/debug/users" className="block text-blue-400 hover:text-blue-300">
              → API Debug Users
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 