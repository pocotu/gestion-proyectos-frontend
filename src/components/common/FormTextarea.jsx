import React from 'react';

/**
 * Componente FormTextarea - Textarea reutilizable con validación
 * Principio de Responsabilidad Única: Solo maneja la lógica de un textarea
 * Principio Abierto/Cerrado: Extensible para diferentes configuraciones
 */
const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  ...props
}) => {
  const textareaId = `textarea-${name}`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        data-testid={`textarea-${name}`}
        className={`form-input resize-vertical ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...props}
      />
      
      <div className="flex justify-between items-center mt-1">
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {maxLength && (
          <p className="text-sm text-gray-500 ml-auto">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormTextarea;