import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Movie } from "../types/movie";

interface FavoritesContextType {
  favorites: Movie[];
  toggleFavorite: (movie: Movie) => void;
  isFavorite: (movieId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "movieExplorerFavorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Movie[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Movie[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(movie: Movie) {
    setFavorites((current) =>
      current.some((favorite) => favorite.id === movie.id)
        ? current.filter((favorite) => favorite.id !== movie.id)
        : [...current, movie],
    );
  }

  function isFavorite(movieId: number) {
    return favorites.some((movie) => movie.id === movieId);
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}