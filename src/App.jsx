import React from 'react'

export default function App(){
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
    </div>
  )
}
