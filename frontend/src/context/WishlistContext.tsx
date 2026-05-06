import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { api } from '../api/config';

interface WishlistItem {
  userId: string;
  productId: number;
  addedAt: string;
}

interface WishlistContextType {
  wishlistProductIds: Set<number>;
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const fetchWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const { data } = await axios.get(
    `${api.baseURL}${api.endpoints.wishlist}?userId=${encodeURIComponent(userId)}`
  );
  return data;
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, userEmail } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems } = useQuery<WishlistItem[]>(
    ['wishlist', userEmail],
    () => fetchWishlist(userEmail!),
    {
      enabled: isLoggedIn && !!userEmail,
      staleTime: 30000,
    }
  );

  const wishlistProductIds = new Set<number>(
    (wishlistItems ?? []).map(item => item.productId)
  );

  const toggleWishlist = async (productId: number) => {
    if (!isLoggedIn || !userEmail) return;

    if (wishlistProductIds.has(productId)) {
      await axios.delete(
        `${api.baseURL}${api.endpoints.wishlist}/${productId}?userId=${encodeURIComponent(userEmail)}`
      );
    } else {
      await axios.post(`${api.baseURL}${api.endpoints.wishlist}`, {
        userId: userEmail,
        productId,
      });
    }
    queryClient.invalidateQueries(['wishlist', userEmail]);
  };

  const isWishlisted = (productId: number) => wishlistProductIds.has(productId);

  const wishlistCount = wishlistProductIds.size;

  return (
    <WishlistContext.Provider value={{ wishlistProductIds, toggleWishlist, isWishlisted, wishlistCount }}>
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
