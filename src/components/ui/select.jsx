import React, { useState, useRef, useEffect } from 'react';

/**
 * Select - Componente de select personalizado reutilizable
 */
export const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            value,
            onValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

/**
 * SelectTrigger - Botón que activa el select
 */
export const SelectTrigger = ({ 
  children, 
  className = '',
  isOpen,
  setIsOpen,
  ...props 
}) => {
  return (
    <button
      type="button"
      className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-500 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <div className="flex items-center justify-between">
        {children}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};

/**
 * SelectValue - Muestra el valor seleccionado
 */
export const SelectValue = ({ placeholder = 'Seleccionar...', value, children }) => {
  return (
    <span className="block truncate">
      {value || children || placeholder}
    </span>
  );
};

/**
 * SelectContent - Contenedor de las opciones
 */
export const SelectContent = ({ 
  children, 
  className = '',
  isOpen,
  onValueChange,
  setIsOpen,
  ...props 
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onValueChange,
            setIsOpen
          });
        }
        return child;
      })}
    </div>
  );
};

/**
 * SelectItem - Opción individual del select
 */
export const SelectItem = ({ 
  children, 
  value, 
  className = '',
  onValueChange,
  setIsOpen,
  ...props 
}) => {
  const handleClick = () => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <div
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};