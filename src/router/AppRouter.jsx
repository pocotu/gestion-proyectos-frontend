import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas públicas
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Páginas privadas
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import TasksPage from '../pages/TasksPage';
// import UsersPage from '../pages/UsersPage';

// Componentes de layout y protección
import Layout from '../components/common/Layout';
import ProtectedRoute, { PublicRoute, AdminRoute } from '../components/common/ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute redirectIfAuthenticated={true}>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute redirectIfAuthenticated={true}>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        {/* Página de no autorizado */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas protegidas con layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard principal */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Gestión de proyectos */}
          <Route path="projects" element={<ProjectsPage />} />
          
          {/* Gestión de tareas */}
          <Route path="tasks" element={<TasksPage />} />
          
          {/* Gestión de usuarios (solo admin) */}
          {/* <Route 
            path="users" 
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            } 
          /> */}
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;