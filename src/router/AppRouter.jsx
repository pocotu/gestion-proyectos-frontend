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
import UsersPage from '../pages/UsersPage';
import ActivityLogsPage from '../pages/ActivityLogsPage';
import FilesPage from '../pages/FilesPage';
import RolesPage from '../pages/RolesPage';
import ReportsPage from '../pages/ReportsPage';

// Componentes de layout y protección
import Layout from '../components/common/Layout';
import ProtectedRoute, { PublicRoute, AdminRoute } from '../components/common/ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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
          
          {/* Gestión de archivos */}
          <Route path="files" element={<FilesPage />} />
          
          {/* Gestión de usuarios (solo admin) */}
          <Route 
            path="users" 
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            } 
          />
          
          {/* Gestión de roles (solo admin) */}
          <Route 
            path="roles" 
            element={
              <AdminRoute>
                <RolesPage />
              </AdminRoute>
            } 
          />
          
          {/* Reportes y estadísticas */}
          <Route path="reports" element={<ReportsPage />} />
          
          {/* Logs de actividad (solo admin) */}
          <Route 
            path="activity-logs" 
            element={
              <AdminRoute>
                <ActivityLogsPage />
              </AdminRoute>
            } 
          />
          
          {/* Alias para logs */}
          <Route path="logs" element={<Navigate to="/activity-logs" replace />} />
          
          {/* Alias para estadísticas */}
          <Route path="stats" element={<Navigate to="/reports" replace />} />
          
          {/* Alias para actividad */}
          <Route path="activity" element={<Navigate to="/activity-logs" replace />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;