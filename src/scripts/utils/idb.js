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

// Menambahkan story ke IndexedDB
export const idbAddStory = async (story) => {
  try {
    const db = await dbPromise;
    return await db.add(STORE_NAME, story); // Menambah story
  } catch (error) {
    console.error('Error menambahkan story ke IndexedDB:', error);
    throw new Error('Failed to add story to IndexedDB');
  }
};

// Mengambil semua story dari IndexedDB
export const idbGetAllStories = async () => {
  try {
    const db = await dbPromise;
    return await db.getAll(STORE_NAME); // Mengambil semua story
  } catch (error) {
    console.error('Error mengambil story dari IndexedDB:', error);
    throw new Error('Failed to retrieve stories from IndexedDB');
  }
};

// Menghapus story dari IndexedDB berdasarkan ID
export const idbDeleteStory = async (id) => {
  try {
    const db = await dbPromise;
    return await db.delete(STORE_NAME, id); // Menghapus story berdasarkan ID
  } catch (error) {
    console.error('Error menghapus story dari IndexedDB:', error);
    throw new Error('Failed to delete story from IndexedDB');
  }
};
