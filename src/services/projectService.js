import { api } from './api';

class ProjectService {

  async getAllProjects(filters = {}) {
    try {
      const response = await api.get('/projects', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProjectById(id) {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProject(id) {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changeProjectStatus(id, status) {
    try {
      const response = await api.patch(`/projects/${id}/status`, {
        estado: status
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProjectStats(id) {
    try {
      const response = await api.get(`/projects/${id}/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProjectTasks(id) {
    try {
      const response = await api.get(`/projects/${id}/tasks`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProjectResponsibles(id) {
    try {
      const response = await api.get(`/projects/${id}/responsibles`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignResponsible(id, userId) {
    try {
      const response = await api.post(`/projects/${id}/responsibles`, {
        usuario_id: userId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeResponsible(id, userId) {
    try {
      const response = await api.delete(`/projects/${id}/responsibles/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchProjects(query, filters = {}) {
    try {
      const response = await api.get('/projects/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProjectsByStatus(status) {
    try {
      const response = await api.get(`/projects/by-status/${status}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyProjects() {
    try {
      const response = await api.get('/projects/my-projects');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getParticipatingProjects() {
    try {
      const response = await api.get('/projects/participating');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || `Error ${status}`;

      switch (status) {
        case 400: return new Error(`Datos inválidos: ${message}`);
        case 401: return new Error('No autorizado');
        case 403: return new Error('Sin permisos');
        case 404: return new Error('No encontrado');
        case 500: return new Error('Error del servidor');
        default: return new Error(message);
      }
    }
    return new Error('Error de conexión');
  }
}

export default new ProjectService();
