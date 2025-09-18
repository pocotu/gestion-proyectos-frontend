import React from 'react';
import './StatsCard.css';

/**
 * StatsCard - Componente para mostrar estadísticas en tarjetas
 * Siguiendo principios SOLID:
 * - Single Responsibility: Solo maneja la visualización de una estadística
 * - Open/Closed: Abierto para extensión (nuevos tipos de estadísticas)
 * - Liskov Substitution: Puede ser sustituido por otros componentes de estadística
 * - Interface Segregation: Props específicas para cada tipo de visualización
 * - Dependency Inversion: No depende de implementaciones específicas
 */
const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  subtitle, 
  percentage, 
  trend,
  onClick,
  loading = false 
}) => {
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  const cardClasses = [
    'stats-card',
    `stats-card--${color}`,
    onClick ? 'stats-card--clickable' : '',
    loading ? 'stats-card--loading' : ''
  ].filter(Boolean).join(' ');

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return <span className="stats-card__trend stats-card__trend--up">↗</span>;
    } else if (trend < 0) {
      return <span className="stats-card__trend stats-card__trend--down">↘</span>;
    }
    return <span className="stats-card__trend stats-card__trend--neutral">→</span>;
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="stats-card__loading">
          <div className="stats-card__skeleton stats-card__skeleton--title"></div>
          <div className="stats-card__skeleton stats-card__skeleton--value"></div>
          <div className="stats-card__skeleton stats-card__skeleton--subtitle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="stats-card__header">
        {icon && (
          <div className="stats-card__icon">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
        )}
        <div className="stats-card__title-section">
          <h3 className="stats-card__title">{title}</h3>
          {getTrendIcon()}
        </div>
      </div>
      
      <div className="stats-card__content">
        <div className="stats-card__value">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {subtitle && (
          <div className="stats-card__subtitle">{subtitle}</div>
        )}
        
        {percentage !== undefined && (
          <div className="stats-card__percentage">
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;