/**
 * XSS Prevention Tests
 * Validates: Requirements 15.4
 * 
 * These tests verify that React automatically escapes user-generated content
 * to prevent XSS (Cross-Site Scripting) attacks.
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectInfoCard from '../../src/components/project/ProjectInfoCard';
import ProjectResponsiblesCard from '../../src/components/project/ProjectResponsiblesCard';
import ProjectTasksCard from '../../src/components/project/ProjectTasksCard';
import ProjectFilesCard from '../../src/components/project/ProjectFilesCard';
import ProjectActivityCard from '../../src/components/project/ProjectActivityCard';

describe('XSS Prevention Tests', () => {
  describe('ProjectInfoCard XSS Prevention', () => {
    it('should escape HTML in project title', () => {
      const maliciousProject = {
        id: 1,
        titulo: '<script>alert("XSS")</script>Proyecto Malicioso',
        descripcion: 'Descripción normal',
        estado: 'en_progreso',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-12-31',
        creator_name: 'Test User',
        creator_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      const { container } = render(<ProjectInfoCard project={maliciousProject} />);
      
      // Verify the script tag is rendered as text, not executed
      expect(container.innerHTML).toContain('&lt;script&gt;');
      expect(container.innerHTML).not.toContain('<script>alert');
      
      // Verify the text content is present
      expect(screen.getByText(/Proyecto Malicioso/)).toBeInTheDocument();
    });

    it('should escape HTML in project description', () => {
      const maliciousProject = {
        id: 1,
        titulo: 'Proyecto Normal',
        descripcion: '<img src=x onerror="alert(\'XSS\')">Descripción maliciosa',
        estado: 'en_progreso',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-12-31',
        creator_name: 'Test User',
        creator_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      const { container } = render(<ProjectInfoCard project={maliciousProject} />);
      
      // Verify the img tag is escaped
      expect(container.innerHTML).toContain('&lt;img');
      expect(container.innerHTML).not.toContain('<img src=x');
    });

    it('should escape HTML in creator name', () => {
      const maliciousProject = {
        id: 1,
        titulo: 'Proyecto Normal',
        descripcion: 'Descripción normal',
        estado: 'en_progreso',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-12-31',
        creator_name: '<b>Bold</b> User',
        creator_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      const { container } = render(<ProjectInfoCard project={maliciousProject} />);
      
      // Verify HTML tags are escaped
      expect(container.innerHTML).toContain('&lt;b&gt;');
      expect(screen.getByText(/Bold.*User/)).toBeInTheDocument();
    });
  });

  describe('ProjectResponsiblesCard XSS Prevention', () => {
    it('should escape HTML in responsible name', () => {
      const maliciousResponsibles = [
        {
          id: 1,
          usuario_id: 1,
          nombre: '<script>alert("XSS")</script>Hacker',
          email: 'hacker@example.com',
          rol_responsabilidad: 'responsable_principal',
          fecha_asignacion: '2024-01-01T00:00:00Z',
          activo: true
        }
      ];

      const { container } = render(
        <ProjectResponsiblesCard responsibles={maliciousResponsibles} />
      );
      
      // Verify script tag is escaped
      expect(container.innerHTML).toContain('&lt;script&gt;');
      expect(container.innerHTML).not.toContain('<script>alert');
    });

    it('should escape HTML in email', () => {
      const maliciousResponsibles = [
        {
          id: 1,
          usuario_id: 1,
          nombre: 'Normal User',
          email: '<a href="javascript:alert(1)">click</a>@example.com',
          rol_responsabilidad: 'colaborador',
          fecha_asignacion: '2024-01-01T00:00:00Z',
          activo: true
        }
      ];

      const { container } = render(
        <ProjectResponsiblesCard responsibles={maliciousResponsibles} />
      );
      
      // Verify anchor tag is escaped
      expect(container.innerHTML).toContain('&lt;a');
      expect(container.innerHTML).not.toContain('<a href="javascript:');
    });
  });

  describe('ProjectTasksCard XSS Prevention', () => {
    it('should escape HTML in task title', () => {
      const maliciousTasks = [
        {
          id: 1,
          titulo: '<iframe src="evil.com"></iframe>Tarea Maliciosa',
          descripcion: 'Descripción normal',
          estado: 'pendiente',
          prioridad: 'alta',
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-12-31',
          assignee_name: 'Test User'
        }
      ];

      const { container } = render(
        <BrowserRouter>
          <ProjectTasksCard tasks={maliciousTasks} projectId={1} />
        </BrowserRouter>
      );
      
      // Verify iframe tag is escaped
      expect(container.innerHTML).toContain('&lt;iframe');
      expect(container.innerHTML).not.toContain('<iframe src=');
    });

    it('should escape HTML in task description', () => {
      const maliciousTasks = [
        {
          id: 1,
          titulo: 'Tarea Normal',
          descripcion: '<svg onload="alert(1)">Descripción maliciosa',
          estado: 'en_progreso',
          prioridad: 'media',
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-12-31',
          assignee_name: 'Test User'
        }
      ];

      const { container } = render(
        <BrowserRouter>
          <ProjectTasksCard tasks={maliciousTasks} projectId={1} />
        </BrowserRouter>
      );
      
      // Verify svg tag is escaped
      expect(container.innerHTML).toContain('&lt;svg');
      expect(container.innerHTML).not.toContain('<svg onload=');
    });

    it('should escape HTML in assignee name', () => {
      const maliciousTasks = [
        {
          id: 1,
          titulo: 'Tarea Normal',
          descripcion: 'Descripción normal',
          estado: 'completada',
          prioridad: 'baja',
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-12-31',
          assignee_name: '<style>body{display:none}</style>Hacker'
        }
      ];

      const { container } = render(
        <BrowserRouter>
          <ProjectTasksCard tasks={maliciousTasks} projectId={1} />
        </BrowserRouter>
      );
      
      // Verify style tag is escaped
      expect(container.innerHTML).toContain('&lt;style&gt;');
      expect(container.innerHTML).not.toContain('<style>body');
    });
  });

  describe('ProjectFilesCard XSS Prevention', () => {
    it('should escape HTML in file name', () => {
      const maliciousFiles = [
        {
          id: 1,
          nombre_archivo: 'file.txt',
          nombre_original: '<script>alert("XSS")</script>malicious.txt',
          tipo: 'txt',
          tipo_mime: 'text/plain',
          tamaño_bytes: 1024,
          ruta_archivo: '/uploads/file.txt',
          uploader_name: 'Test User',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      const { container } = render(
        <ProjectFilesCard files={maliciousFiles} projectId={1} />
      );
      
      // Verify script tag is escaped
      expect(container.innerHTML).toContain('&lt;script&gt;');
      expect(container.innerHTML).not.toContain('<script>alert');
    });

    it('should escape HTML in uploader name', () => {
      const maliciousFiles = [
        {
          id: 1,
          nombre_archivo: 'file.txt',
          nombre_original: 'normal.txt',
          tipo: 'txt',
          tipo_mime: 'text/plain',
          tamaño_bytes: 1024,
          ruta_archivo: '/uploads/file.txt',
          uploader_name: '<marquee>Hacker</marquee>',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      const { container } = render(
        <ProjectFilesCard files={maliciousFiles} projectId={1} />
      );
      
      // Verify marquee tag is escaped
      expect(container.innerHTML).toContain('&lt;marquee&gt;');
      expect(container.innerHTML).not.toContain('<marquee>');
    });
  });

  describe('ProjectActivityCard XSS Prevention', () => {
    it('should escape HTML in user name', () => {
      const maliciousLogs = [
        {
          id: 1,
          usuario_id: 1,
          user_name: '<script>alert("XSS")</script>Hacker',
          accion: 'created',
          descripcion: 'Creó el proyecto',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      const { container } = render(
        <ProjectActivityCard activityLogs={maliciousLogs} />
      );
      
      // Verify script tag is escaped
      expect(container.innerHTML).toContain('&lt;script&gt;');
      expect(container.innerHTML).not.toContain('<script>alert');
    });

    it('should escape HTML in description', () => {
      const maliciousLogs = [
        {
          id: 1,
          usuario_id: 1,
          user_name: 'Normal User',
          accion: 'updated',
          descripcion: '<img src=x onerror="alert(1)">Actualizó el proyecto',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      const { container } = render(
        <ProjectActivityCard activityLogs={maliciousLogs} />
      );
      
      // Verify img tag is escaped
      expect(container.innerHTML).toContain('&lt;img');
      expect(container.innerHTML).not.toContain('<img src=x');
    });
  });

  describe('Multiple XSS Attack Vectors', () => {
    it('should prevent XSS through event handlers', () => {
      const maliciousProject = {
        id: 1,
        titulo: '<div onclick="alert(1)">Click me</div>',
        descripcion: '<button onmouseover="alert(1)">Hover</button>',
        estado: 'en_progreso',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-12-31',
        creator_name: 'Test User',
        creator_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      const { container } = render(<ProjectInfoCard project={maliciousProject} />);
      
      // Verify event handlers are escaped
      expect(container.innerHTML).not.toContain('onclick=');
      expect(container.innerHTML).not.toContain('onmouseover=');
    });

    it('should prevent XSS through javascript: protocol', () => {
      const maliciousProject = {
        id: 1,
        titulo: 'Normal Title',
        descripcion: '<a href="javascript:alert(1)">Click</a>',
        estado: 'en_progreso',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-12-31',
        creator_name: 'Test User',
        creator_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      const { container } = render(<ProjectInfoCard project={maliciousProject} />);
      
      // Verify javascript: protocol is escaped
      expect(container.innerHTML).not.toContain('javascript:alert');
    });

    it('should prevent XSS through data: protocol', () => {
      const maliciousProject = {
        id: 1,
        titulo: 'Normal Title',
        descripcion: '<object data="data:text/html,<script>alert(1)</script>">',
        estado: 'en_progreso',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-12-31',
        creator_name: 'Test User',
        creator_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      const { container } = render(<ProjectInfoCard project={maliciousProject} />);
      
      // Verify object tag is escaped
      expect(container.innerHTML).toContain('&lt;object');
      expect(container.innerHTML).not.toContain('<object data=');
    });
  });
});
