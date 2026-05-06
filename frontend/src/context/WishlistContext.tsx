import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from './AuthContext';
import { api } from '../api/config';

const LOCAL_STORAGE_KEY = 'octocat-wishlist-temp';

interface WishlistItem {
  wishlistId: number;
  userId: number;
  productId: number;
  dateAdded: string;
  notes?: string;
}

interface WishlistContextType {
  wishlistProductIds: number[];
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  toastMessage: string | null;
  clearToast: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

// --- localStorage helpers ---
const readLocalWishlist = (): number[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
};

const writeLocalWishlist = (productIds: number[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(productIds));
  } catch {
    // Ignore storage errors (e.g., private browsing / quota)
  }
};

const clearLocalWishlist = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore
  }
};

// --- API helpers ---
const fetchWishlist = async (userId: number): Promise<WishlistItem[]> => {
  const { data } = await axios.get<WishlistItem[]>(
    `${api.baseURL}${api.endpoints.wishlist}/${userId}`
  );
  return data;
};

const mergeWishlist = async (userId: number, productIds: number[]): Promise<WishlistItem[]> => {
  const { data } = await axios.post<WishlistItem[]>(
    `${api.baseURL}${api.endpoints.wishlist}/${userId}/merge`,
    { productIds }
  );
  return data;
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, userId } = useAuth();
  const queryClient = useQueryClient();
  const [localIds, setLocalIds] = useState<number[]>(() => readLocalWishlist());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mergeDone, setMergeDone] = useState(false);

  // Fetch from API when authenticated
  const { data: apiItems = [], isLoading: apiLoading } = useQuery<WishlistItem[]>(
    ['wishlist', userId],
    () => fetchWishlist(userId!),
    {
      enabled: isLoggedIn && userId !== null,
      staleTime: 30_000,
    }
  );

  // Merge on login
  useEffect(() => {
    if (!isLoggedIn || userId === null || mergeDone) return;

    const localWishlist = readLocalWishlist();
    if (localWishlist.length === 0) {
      setMergeDone(true);
      return;
    }

    mergeWishlist(userId, localWishlist)
      .then((merged) => {
        clearLocalWishlist();
        setLocalIds([]);
        queryClient.setQueryData(['wishlist', userId], merged);
        setToastMessage(`${localWishlist.length} item${localWishlist.length !== 1 ? 's' : ''} from your wishlist have been saved`);
        setMergeDone(true);
      })
      .catch(() => {
        // If merge fails, keep localStorage intact so no data is lost
        setMergeDone(true);
      });
  }, [isLoggedIn, userId, mergeDone, queryClient]);

  // Reset merge flag on logout so it runs again next login
  useEffect(() => {
    if (!isLoggedIn) {
      setMergeDone(false);
    }
  }, [isLoggedIn]);

  // Sync localIds to localStorage whenever they change
  useEffect(() => {
    if (!isLoggedIn) {
      writeLocalWishlist(localIds);
    }
  }, [localIds, isLoggedIn]);

  const wishlistItems: WishlistItem[] = isLoggedIn ? apiItems : [];
  const wishlistProductIds: number[] = isLoggedIn
    ? apiItems.map((w) => w.productId)
    : localIds;

  const isInWishlist = useCallback(
    (productId: number) => wishlistProductIds.includes(productId),
    [wishlistProductIds]
  );

  const addToWishlist = useCallback(
    async (productId: number) => {
      if (isLoggedIn && userId !== null) {
        // Optimistic update
        const optimistic: WishlistItem = {
          wishlistId: Date.now(),
          userId,
          productId,
          dateAdded: new Date().toISOString(),
        };
        queryClient.setQueryData<WishlistItem[]>(['wishlist', userId], (old = []) => [
          ...old,
          optimistic,
        ]);
        try {
          await axios.post(`${api.baseURL}${api.endpoints.wishlist}`, {
            userId,
            productId,
          });
          await queryClient.invalidateQueries(['wishlist', userId]);
        } catch {
          // Rollback
          queryClient.setQueryData<WishlistItem[]>(['wishlist', userId], (old = []) =>
            old.filter((w) => w.productId !== productId)
          );
        }
      } else {
        setLocalIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
      }
    },
    [isLoggedIn, userId, queryClient]
  );

  const removeFromWishlist = useCallback(
    async (productId: number) => {
      if (isLoggedIn && userId !== null) {
        // Optimistic update
        const previous = queryClient.getQueryData<WishlistItem[]>(['wishlist', userId]) ?? [];
        queryClient.setQueryData<WishlistItem[]>(['wishlist', userId], (old = []) =>
          old.filter((w) => w.productId !== productId)
        );
        try {
          await axios.delete(
            `${api.baseURL}${api.endpoints.wishlist}/${userId}/${productId}`
          );
        } catch {
          // Rollback
          queryClient.setQueryData(['wishlist', userId], previous);
        }
      } else {
        setLocalIds((prev) => prev.filter((id) => id !== productId));
      }
    },
    [isLoggedIn, userId, queryClient]
  );

  const clearWishlist = useCallback(async () => {
    if (isLoggedIn && userId !== null) {
      const previous = queryClient.getQueryData<WishlistItem[]>(['wishlist', userId]) ?? [];
      queryClient.setQueryData(['wishlist', userId], []);
      try {
        await axios.delete(`${api.baseURL}${api.endpoints.wishlist}/${userId}`);
      } catch {
        queryClient.setQueryData(['wishlist', userId], previous);
      }
    } else {
      clearLocalWishlist();
      setLocalIds([]);
    }
  }, [isLoggedIn, userId, queryClient]);

  const clearToast = useCallback(() => setToastMessage(null), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistItems,
        isLoading: isLoggedIn ? apiLoading : false,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
