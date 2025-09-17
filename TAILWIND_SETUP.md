# Frontend - Configuración Tailwind CSS

## ✅ Configuración Completada

El proyecto frontend ha sido configurado con **Tailwind CSS** como framework de estilos exclusivo.

## 📦 Dependencias Instaladas

```json
{
  "tailwindcss": "^3.3.x",
  "autoprefixer": "^10.4.x", 
  "postcss": "^8.4.x"
}
```

## 🛠️ Archivos de Configuración

### `tailwind.config.js`
- Configuración principal de Tailwind
- Colores personalizados (primary, secondary)
- Fuente Inter como predeterminada
- Content paths para purging CSS

### `postcss.config.js`
- Configuración de PostCSS con Tailwind y Autoprefixer

### `src/styles/globals.css`
- Importa las directivas de Tailwind (@tailwind base, components, utilities)
- Componentes personalizados usando @apply:
  - `.btn-primary` - Botón principal
  - `.btn-secondary` - Botón secundario
  - `.card` - Tarjeta básica
  - `.form-input` - Input de formulario
  - `.form-label` - Label de formulario

## 🎨 Sistema de Colores

```css
primary: {
  50: '#eff6ff',
  500: '#3b82f6', 
  600: '#2563eb',
  700: '#1d4ed8'
}

secondary: {
  50: '#f8fafc',
  500: '#64748b',
  600: '#475569', 
  700: '#334155'
}
```

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## 💡 Uso en Componentes

```jsx
// Clases de Tailwind directas
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Contenido
</div>

// Componentes personalizados
<button className="btn-primary">
  Botón Primario
</button>

<div className="card">
  <input className="form-input" type="text" />
</div>
```

## 📱 Responsive Design

Tailwind incluye breakpoints responsivos:
- `sm:` (640px+)
- `md:` (768px+) 
- `lg:` (1024px+)
- `xl:` (1280px+)
- `2xl:` (1536px+)

Ejemplo:
```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive
</div>
```

## ✨ Características MVP

- **Desarrollo rápido** con clases utilitarias
- **Diseño responsivo** integrado  
- **Componentes reutilizables** predefinidos
- **Consistencia visual** en todo el proyecto
- **Bundle optimizado** con purging automático