import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { api } from '../api/config';

interface WishlistItem {
  wishlistId: number;
  userId: number;
  productId: number;
  dateAdded: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: unknown;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { userId, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const wishlistUrl = `${api.baseURL}${api.endpoints.wishlist}`;

  const { data: wishlistItems = [], isLoading, error } = useQuery<WishlistItem[]>(
    ['wishlist', userId],
    async () => {
      if (!userId) return [];
      const { data } = await axios.get<WishlistItem[]>(`${wishlistUrl}/${userId}`);
      return data;
    },
    {
      enabled: isLoggedIn && userId !== null,
      staleTime: 30000
    }
  );

  const addMutation = useMutation(
    (productId: number) =>
      axios.post<WishlistItem>(wishlistUrl, { userId, productId }),
    {
      onMutate: async (productId: number) => {
        await queryClient.cancelQueries(['wishlist', userId]);
        const previous = queryClient.getQueryData<WishlistItem[]>(['wishlist', userId]);
        const optimistic: WishlistItem = {
          wishlistId: Date.now(),
          userId: userId!,
          productId,
          dateAdded: new Date().toISOString()
        };
        queryClient.setQueryData<WishlistItem[]>(['wishlist', userId], old =>
          [...(old ?? []), optimistic]
        );
        return { previous };
      },
      onError: (_err, _productId, context) => {
        if (context?.previous !== undefined) {
          queryClient.setQueryData(['wishlist', userId], context.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['wishlist', userId]);
      }
    }
  );

  const removeMutation = useMutation(
    (productId: number) =>
      axios.delete(`${wishlistUrl}/${userId}/${productId}`),
    {
      onMutate: async (productId: number) => {
        await queryClient.cancelQueries(['wishlist', userId]);
        const previous = queryClient.getQueryData<WishlistItem[]>(['wishlist', userId]);
        queryClient.setQueryData<WishlistItem[]>(['wishlist', userId], old =>
          (old ?? []).filter(item => item.productId !== productId)
        );
        return { previous };
      },
      onError: (_err, _productId, context) => {
        if (context?.previous !== undefined) {
          queryClient.setQueryData(['wishlist', userId], context.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['wishlist', userId]);
      }
    }
  );

  const addToWishlist = async (productId: number) => {
    await addMutation.mutateAsync(productId);
  };

  const removeFromWishlist = async (productId: number) => {
    await removeMutation.mutateAsync(productId);
  };

  const isInWishlist = (productId: number) =>
    wishlistItems.some(item => item.productId === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length
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
