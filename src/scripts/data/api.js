import CONFIG from "../utils/config.js";
import { getToken } from "../utils/index.js";
import { idbAddStory } from "../utils/idb.js";

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getStories(location = 1) {
    try {
      const token = getToken();
      const response = await fetch(
        `${this.baseUrl}/stories?location=${location}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch stories");
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create story");
      }

      return data;
    } catch (error) {
      console.warn(
        "Tidak bisa terhubung ke API. Menyimpan cerita ke offline DB...",
        error
      );

      //EXTRACT DATA DARI FORMDATA
      const photo = formData.get("photo");
      const description = formData.get("description");
      const lat = parseFloat(formData.get("lat"));
      const lon = parseFloat(formData.get("lon"));

      // Validasi data sebelum simpan
      if (!photo || !description) {
        throw new Error("Data tidak lengkap untuk disimpan offline");
      }

      // Prepare data untuk IndexedDB
      const offlineStory = {
        photo: photo,  
        description: description,
        lat: lat,
        lon: lon
      };

      try {
        // Simpan ke IndexedDB
        await idbAddStory(offlineStory);
        
        console.log("Story berhasil disimpan ke IndexedDB");

        // Return response offline
        return {
          error: false,
          message: "Story disimpan offline. Akan dikirim otomatis saat online.",
          offline: true,
        };
      } catch (idbError) {
        console.error("Gagal menyimpan ke IndexedDB:", idbError);
        throw new Error("Gagal menyimpan story (offline maupun online)");
      }
    }
  }
}

export default new ApiService();