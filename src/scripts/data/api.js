import CONFIG from '../utils/config.js';
import { getToken } from '../utils/index.js';

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getStories(location = 1) {
    try {
      const token = getToken();
      const response = await fetch(`${this.baseUrl}/stories?location=${location}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stories');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async createStory(formData) {
    try {
      const token = getToken();
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create story');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ApiService();