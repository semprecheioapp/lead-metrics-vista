import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (phoneNumber: string) => void;
  removeFavorite: (phoneNumber: string) => void;
  toggleFavorite: (phoneNumber: string) => void;
  isFavorite: (phoneNumber: string) => boolean;
  getFavorites: () => string[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (phoneNumber: string) =>
        set((state) => {
          const currentFavorites = Array.isArray(state.favorites) ? state.favorites : [];
          return {
            favorites: currentFavorites.includes(phoneNumber) 
              ? currentFavorites 
              : [...currentFavorites, phoneNumber]
          };
        }),
      
      removeFavorite: (phoneNumber: string) =>
        set((state) => {
          const currentFavorites = Array.isArray(state.favorites) ? state.favorites : [];
          return {
            favorites: currentFavorites.filter(f => f !== phoneNumber)
          };
        }),
      
      toggleFavorite: (phoneNumber: string) => {
        const { favorites } = get();
        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        if (currentFavorites.includes(phoneNumber)) {
          get().removeFavorite(phoneNumber);
        } else {
          get().addFavorite(phoneNumber);
        }
      },
      
      isFavorite: (phoneNumber: string) => {
        const { favorites } = get();
        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        return currentFavorites.includes(phoneNumber);
      },
      
      getFavorites: () => {
        const { favorites } = get();
        return Array.isArray(favorites) ? favorites : [];
      },
    }),
    {
      name: 'whatsapp-favorites',
      // Add migration to handle corrupted data
      migrate: (persistedState: any, version: number) => {
        if (persistedState && !Array.isArray(persistedState.favorites)) {
          persistedState.favorites = [];
        }
        return persistedState;
      },
      // Add version to trigger migration
      version: 1,
    }
  )
);