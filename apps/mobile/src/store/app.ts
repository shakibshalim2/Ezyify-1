import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
  hydrated: boolean;
  onboardingSeen: boolean;
  interests: string[];
  likedPostIds: string[];
  savedPostIds: string[];
  followedIds: string[];
  markOnboardingSeen(): void;
  setInterests(ids: string[]): void;
  toggleLike(id: string): void;
  toggleSave(id: string): void;
  toggleFollow(id: string): void;
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

/** Non-sensitive UI preferences; session/cart live in the SecureStore-backed core stores. */
export const useAppStore = create<AppState>()(
  persist(
    set => ({
      hydrated: false,
      onboardingSeen: false,
      interests: [],
      likedPostIds: [],
      savedPostIds: [],
      followedIds: [],
      markOnboardingSeen: () => set({ onboardingSeen: true }),
      setInterests: interests => set({ interests }),
      toggleLike: id => set(s => ({ likedPostIds: toggle(s.likedPostIds, id) })),
      toggleSave: id => set(s => ({ savedPostIds: toggle(s.savedPostIds, id) })),
      toggleFollow: id => set(s => ({ followedIds: toggle(s.followedIds, id) })),
    }),
    {
      name: 'ezyify.app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({ onboardingSeen: s.onboardingSeen, interests: s.interests, likedPostIds: s.likedPostIds, savedPostIds: s.savedPostIds, followedIds: s.followedIds }) as Partial<AppState>,
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);
