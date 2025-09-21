import React, { useState } from 'react'
import StyleDebugger from './components/debug/StyleDebugger'

export default function App(){
  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Proyectos MVP
          </h1>
          <p className="text-gray-600 mb-6">
            Frontend configurado con React + Vite + Tailwind CSS
          </p>
          
          {/* Botón para activar el debugger */}
          <div className="mb-4">
            <button 
              onClick={() => setShowDebugger(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🐛 Abrir Style Debugger
            </button>
          </div>

          {/* Elementos de prueba con diferentes colores */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
              <p className="font-medium">Elemento con colores azules (problema)</p>
              <p className="text-sm">Este elemento usa bg-blue-100 y text-blue-800</p>
            </div>
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <p className="font-medium">Elemento con colores slate (correcto)</p>
              <p className="text-sm">Este elemento usa bg-gray-100 y text-gray-800</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="btn-primary w-full">
              Botón Primario
            </button>
            <button className="btn-secondary w-full">
              Botón Secundario
            </button>
          </div>
          <div className="mt-6">
            <label className="form-label">
              Campo de ejemplo
            </label>
            <input 
              type="text" 
              className="form-input"
              placeholder="Ingresa texto aquí..."
            />
          </div>
        </div>
      </div>

      {/* Style Debugger */}
      <StyleDebugger 
        isOpen={showDebugger} 
        onClose={() => setShowDebugger(false)} 
      />
    </div>
  )
}
