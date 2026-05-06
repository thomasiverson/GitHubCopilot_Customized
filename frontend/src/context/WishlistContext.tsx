/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WishlistEntry {
  productId: number;
  savedPrice: number;
  addedAt: string;
}

interface WishlistContextType {
  wishlistEntries: WishlistEntry[];
  toggleWishlist: (product: { productId: number; price: number; discount?: number }) => void;
  isWishlisted: (productId: number) => boolean;
  wishlistCount: number;
  getPriceDrop: (product: { productId: number; price: number; discount?: number }) => number | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'wishlist_v2';

const getEffectivePrice = (price: number, discount?: number): number =>
  discount ? price * (1 - discount) : price;

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistEntries, setWishlistEntries] = useState<WishlistEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as WishlistEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistEntries));
  }, [wishlistEntries]);

  const toggleWishlist = (product: { productId: number; price: number; discount?: number }) => {
    setWishlistEntries(prev => {
      const exists = prev.find(e => e.productId === product.productId);
      if (exists) {
        return prev.filter(e => e.productId !== product.productId);
      }
      return [
        ...prev,
        {
          productId: product.productId,
          savedPrice: getEffectivePrice(product.price, product.discount),
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const isWishlisted = (productId: number): boolean =>
    wishlistEntries.some(e => e.productId === productId);

  const wishlistCount = wishlistEntries.length;

  const getPriceDrop = (product: { productId: number; price: number; discount?: number }): number | null => {
    const entry = wishlistEntries.find(e => e.productId === product.productId);
    if (!entry) return null;
    const currentPrice = getEffectivePrice(product.price, product.discount);
    return currentPrice - entry.savedPrice;
  };

  return (
    <WishlistContext.Provider value={{ wishlistEntries, toggleWishlist, isWishlisted, wishlistCount, getPriceDrop }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
