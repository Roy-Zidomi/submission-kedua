import { idbGetAllStories, idbDeleteStory } from './idb.js';
import Config from './config.js';

export const syncOfflineStories = async () => {
  const offlineStories = await idbGetAllStories();
  if (offlineStories.length === 0) {
    console.log("❌ Tidak ada cerita offline yang perlu disinkronkan.");
    return;
  }

  console.log("🔁 Mulai sinkronisasi cerita offline...");

  const token = localStorage.getItem('token');
  if (!token) {
    console.error("❌ Tidak ada token, pastikan user sudah login.");
    return;
  }

  for (const story of offlineStories) {
    try {
      // Menyiapkan FormData untuk upload ke API
      const formData = new FormData();
      formData.append("photo", story.photo);  // File
      formData.append("description", story.description);
      formData.append("lat", story.lat);
      formData.append("lon", story.lon);

      // Melakukan request POST ke API untuk menyimpan story
      const response = await fetch(`${Config.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Tidak perlu set Content-Type di sini, karena FormData sudah menangani itu
        },
        body: formData,
      });

      if (response.ok) {
        console.log(`✔️ Cerita ${story.id} berhasil disinkronkan ke server.`);
        await idbDeleteStory(story.id);  // Hapus data offline setelah sukses
      } else {
        const responseBody = await response.json();
        console.error(`❌ Gagal menyinkronkan cerita ${story.id}: ${responseBody.message || "Tidak diketahui"}`);
      }
    } catch (err) {
      console.error(`❌ Terjadi error saat mencoba menyinkronkan cerita ${story.id}:`, err);
    }
  }

  console.log("✔️ Sinkronisasi selesai.");
};
