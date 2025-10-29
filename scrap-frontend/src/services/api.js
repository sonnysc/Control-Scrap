// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Si tenemos token, lo agregamos al header
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Si hay body, convertirlo a JSON
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      // Obtener el texto de la respuesta primero
      const responseText = await response.text();

      let data;
      try {
        // Intentar parsear como JSON
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        // Si no es JSON, crear un objeto de error
        console.warn('Respuesta no es JSON:', responseText.substring(0, 100));
        throw new Error(`La respuesta del servidor no es JSON válido: ${response.status} ${response.statusText}`);
      }

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Error en petición API:', error);
      throw error;
    }
  },

  // Método de Autenticación
  login(username, password) {
    return this.request('/login', {
      method: 'POST',
      body: { username, password },
    });
  },

  logout() {
    return this.request('/logout', {
      method: 'POST',
    });
  },

  getUser() {
    return this.request('/user');
  },

  // Metodo de gestión de usuarios
  getUsers() {
    return this.request('/users');
  },

  createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  },

  updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  },

  deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  toggleUserStatus(id) {
    return this.request(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  // Metodo de registro de scrap 
  getRegistrosScrap() {
    return this.request('/registros-scrap');
  },

  createRegistroScrap(registroData) {
    return this.request('/registros-scrap', {
      method: 'POST',
      body: registroData,
    });
  },

  getRegistroScrapStats() {
    return this.request('/registros-scrap/stats');
  },

  getRegistroScrapById(id) {
    return this.request(`/registros-scrap/${id}`);
  },

  // Metodo de recepcion de scrap
  getRecepcionesScrap() {
    return this.request('/recepciones-scrap');
  },

  getRegistrosPendientes() {
    return this.request('/recepciones-scrap/registros-pendientes');
  },

  createRecepcionScrap(recepcionData) {
    return this.request('/recepciones-scrap', {
      method: 'POST',
      body: recepcionData,
    });
  },

  getRecepcionScrapStats() {
    return this.request('/recepciones-scrap/stats');
  },

  getRecepcionScrapById(id) {
    return this.request(`/recepciones-scrap/${id}`);
  },

}