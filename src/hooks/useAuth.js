import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Hook personalizado para manejar autenticación
 * Principio de Responsabilidad Única: Solo maneja lógica de autenticación
 * Principio de Inversión de Dependencias: Abstrae el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};