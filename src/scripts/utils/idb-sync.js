import { idbGetUnsyncedStories, idbDeleteStory, idbUpdateStorySync, base64ToFile } from './idb.js';
import Config from './config.js';
import { getToken } from './index.js';

export const syncOfflineStories = async () => {
  if (!navigator.onLine) {
    console.log("Masih offline, sinkronisasi ditunda.");
    return;
  }

  const offlineStories = await idbGetUnsyncedStories();
  
  if (offlineStories.length === 0) {
    console.log("Tidak ada cerita offline yang perlu disinkronkan.");
    return;
  }

  console.log(`Mulai sinkronisasi ${offlineStories.length} cerita offline...`);

  const token = getToken();
  if (!token) {
    console.error("Tidak ada token, pastikan user sudah login.");
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const story of offlineStories) {
    try {
      console.log(`Mengirim story ID ${story.id}...`);

      // Konversi base64 kembali ke File object
      const photoFile = base64ToFile(
        story.photoBase64,
        story.photoName,
        story.photoType
      );

      // Menyiapkan FormData untuk upload ke API
      const formData = new FormData();
      formData.append("photo", photoFile);
      formData.append("description", story.description);
      
      if (story.lat !== undefined && story.lon !== undefined) {
        formData.append("lat", story.lat);
        formData.append("lon", story.lon);
      }

      // Melakukan request POST ke API untuk menyimpan story
      const response = await fetch(`${Config.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Story ID ${story.id} berhasil disinkronkan ke server.`);
        
        // Hapus dari IndexedDB setelah berhasil sync
        await idbDeleteStory(story.id);
        successCount++;
      } else {
        const errorData = await response.json();
        console.error(`Gagal sync story ID ${story.id}:`, errorData.message || response.statusText);
        failCount++;
        
        // Optional: update status tapi jangan hapus, biar bisa retry
        await idbUpdateStorySync(story.id, false);
      }
    } catch (err) {
      console.error(`Error saat sync story ID ${story.id}:`, err);
      failCount++;
      
      // Jangan hapus story yang gagal, biar bisa dicoba lagi
      await idbUpdateStorySync(story.id, false);
    }
  }

  console.log(`Sinkronisasi selesai: ${successCount} berhasil, ${failCount} gagal`);
  
  // Tampilkan notifikasi ke user
  if (successCount > 0) {
    showSyncNotification(`${successCount} cerita berhasil disinkronkan!`);
  }
  
  if (failCount > 0) {
    showSyncNotification(`${failCount} cerita gagal disinkronkan. Akan dicoba lagi nanti.`, 'warning');
  }
};

// Helper untuk menampilkan notifikasi sync
const showSyncNotification = (message, type = 'success') => {
  if (typeof window.showAlert === 'function') {
    window.showAlert(message, type);
  } else {
    console.log(message);
    
    // Fallback: tampilkan notifikasi sederhana
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Story Sync', {
        body: message,
        icon: '/icons/icon-192x192.png'
      });
    }
  }
};

// Auto-sync saat kembali online (dipanggil dari index.js)
window.addEventListener('online', () => {
  console.log('Koneksi internet kembali! Memulai auto-sync...');
  syncOfflineStories();
});

let syncInterval;

export const startPeriodicSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Sync setiap 5 menit
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      console.log('Periodic sync triggered...');
      syncOfflineStories();
    }
  }, 5 * 60 * 1000); 
};

export const stopPeriodicSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};