import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import AppRouter from './router/AppRouter';
import './styles/globals.css';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProjectProvider>
          <TaskProvider>
            <AppRouter />
          </TaskProvider>
        </ProjectProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
