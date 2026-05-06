import { createContext } from 'react';

export interface WishlistItem {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  discount?: number;
  dateAdded: string;
}

export type WishlistContextType = {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'dateAdded'>) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
};

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
