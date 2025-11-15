import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const STORE_NAME = 'offline-stories';

// Membuka atau membuat database
export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  },
});

// Helper: Convert File/Blob to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper: Convert Base64 back to File
export const base64ToFile = (base64String, filename, mimeType) => {
  const arr = base64String.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
};

// Menambahkan story ke IndexedDB (dengan konversi file ke base64)
export const idbAddStory = async (storyData) => {
  try {
    // Konversi file photo ke base64 agar bisa disimpan di IndexedDB
    const photoBase64 = await fileToBase64(storyData.photo);
    
    const story = {
      description: storyData.description,
      photoBase64: photoBase64,
      photoName: storyData.photo.name,
      photoType: storyData.photo.type,
      lat: storyData.lat,
      lon: storyData.lon,
      createdAt: new Date().toISOString(),
      synced: false
    };

    const db = await dbPromise;
    const id = await db.add(STORE_NAME, story);
    console.log('Story berhasil disimpan ke IndexedDB dengan ID:', id);
    return id;
  } catch (error) {
    console.error('Error menambahkan story ke IndexedDB:', error);
    throw new Error('Failed to add story to IndexedDB');
  }
};

// Mengambil semua story dari IndexedDB
export const idbGetAllStories = async () => {
  try {
    const db = await dbPromise;
    const stories = await db.getAll(STORE_NAME);
    console.log(`Ditemukan ${stories.length} story di IndexedDB`);
    return stories;
  } catch (error) {
    console.error('Error mengambil story dari IndexedDB:', error);
    throw new Error('Failed to retrieve stories from IndexedDB');
  }
};

// Mengambil story yang belum di-sync
export const idbGetUnsyncedStories = async () => {
  try {
    const db = await dbPromise;
    const allStories = await db.getAll(STORE_NAME);
    const unsyncedStories = allStories.filter(story => !story.synced);
    console.log(`Ditemukan ${unsyncedStories.length} story yang belum di-sync`);
    return unsyncedStories;
  } catch (error) {
    console.error('Error mengambil unsynced stories:', error);
    return [];
  }
};

// Menghapus story dari IndexedDB berdasarkan ID
export const idbDeleteStory = async (id) => {
  try {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
    console.log(`Story dengan ID ${id} berhasil dihapus dari IndexedDB`);
    return true;
  } catch (error) {
    console.error('Error menghapus story dari IndexedDB:', error);
    throw new Error('Failed to delete story from IndexedDB');
  }
};

// Update status sync story
export const idbUpdateStorySync = async (id, synced = true) => {
  try {
    const db = await dbPromise;
    const story = await db.get(STORE_NAME, id);
    if (story) {
      story.synced = synced;
      story.syncedAt = new Date().toISOString();
      await db.put(STORE_NAME, story);
      console.log(`Story ID ${id} ditandai sebagai synced`);
    }
    return true;
  } catch (error) {
    console.error('Error update story sync status:', error);
    return false;
  }
};

// Clear semua data (untuk testing/reset)
export const idbClearAll = async () => {
  try {
    const db = await dbPromise;
    await db.clear(STORE_NAME);
    console.log('Semua data IndexedDB berhasil dihapus');
    return true;
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    return false;
  }
};