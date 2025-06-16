"use client";

import { useState } from "react";

export default function InitDatabase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const initDatabase = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/init-db", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error || data.details}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Inicializar Base de Datos
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Crear tabla de usuarios en Neon PostgreSQL
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={initDatabase}
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {loading ? "Creando tabla..." : "Crear Tabla de Usuarios"}
          </button>

          {result && (
            <div className={`p-4 rounded-md ${
              result.includes("✅") 
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
              {result}
            </div>
          )}

          <div className="text-sm text-gray-400">
            <p className="mb-2">Esta acción creará:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tabla <code className="bg-gray-700 px-1 rounded">users</code></li>
              <li>Columna <code className="bg-gray-700 px-1 rounded">id</code> (SERIAL PRIMARY KEY)</li>
              <li>Columna <code className="bg-gray-700 px-1 rounded">email</code> (VARCHAR UNIQUE)</li>
              <li>Columna <code className="bg-gray-700 px-1 rounded">password</code> (VARCHAR)</li>
              <li>Columna <code className="bg-gray-700 px-1 rounded">created_at</code> (TIMESTAMP)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 