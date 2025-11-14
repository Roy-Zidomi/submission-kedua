import { idbGetAllStories, idbDeleteStory } from './idb.js';
import Config from './config.js';

export const syncOfflineStories = async () => {
  const offlineStories = await idbGetAllStories();
  if (offlineStories.length === 0) return;

  console.log('🔁 Syncing offline stories...', offlineStories);

  for (const story of offlineStories) {
    try {
      await fetch(`${Config.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(story),
      });

      await idbDeleteStory(story.id);

      console.log(`✔️ Synced story: ${story.id}`);
    } catch (error) {
      console.error('❌ Failed to sync:', error);
    }
  }
};
