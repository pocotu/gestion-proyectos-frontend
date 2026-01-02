import { useState, useRef, useEffect } from 'react';

/**
 * MultiSelect - Componente de selección múltiple con checkboxes
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la selección múltiple de opciones
 * - Open/Closed: Extensible mediante props
 */
const MultiSelect = ({ 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = 'Seleccionar...', 
  disabled = false,
  label = '',
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionToggle = (e, optionId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSelectedValues = selectedValues.includes(optionId)
      ? selectedValues.filter(id => id !== optionId)
      : [...selectedValues, optionId];
    
    onChange(newSelectedValues);
  };

  const getSelectedLabels = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    
    const selectedOptions = options.filter(opt => selectedValues.includes(opt.id));
    return selectedOptions.map(opt => opt.nombre).join(', ');
  };

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">{label}</label>
      )}
      <div className="position-relative" ref={dropdownRef}>
        <div
          className={`form-control d-flex justify-content-between align-items-center ${error ? 'is-invalid' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={handleToggle}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', minHeight: '38px' }}
        >
          <span className={selectedValues.length === 0 ? 'text-muted' : ''}>
            {getSelectedLabels()}
          </span>
          <svg 
            style={{ 
              width: '16px', 
              height: '16px', 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && !disabled && (
          <div 
            className="dropdown-menu show w-100" 
            style={{ 
              maxHeight: '250px', 
              overflowY: 'auto',
              position: 'absolute',
              zIndex: 1000
            }}
          >
            {options.length === 0 ? (
              <div className="dropdown-item text-muted">No hay opciones disponibles</div>
            ) : (
              options.map(option => (
                <div 
                  key={option.id} 
                  className="dropdown-item"
                  onClick={(e) => handleOptionToggle(e, option.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedValues.includes(option.id)}
                      readOnly
                      style={{ pointerEvents: 'none' }}
                    />
                    <label className="form-check-label" style={{ cursor: 'pointer', userSelect: 'none' }}>
                      {option.nombre}
                      {option.email && (
                        <small className="text-muted d-block">{option.email}</small>
                      )}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {error && (
          <div className="invalid-feedback d-block">{error}</div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
