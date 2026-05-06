/* eslint-disable react-refresh/only-export-components */
import React, { useContext, useState, useEffect } from 'react';
import { WishlistContext, WishlistItem } from './wishlistContextUtils';

const WISHLIST_STORAGE_KEY = 'octocat-wishlist';

function loadFromStorage(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: WishlistItem[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Gracefully handle private browsing / quota exceeded
  }
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(wishlistItems);
  }, [wishlistItems]);

  const addToWishlist = (item: Omit<WishlistItem, 'dateAdded'>) => {
    setWishlistItems(prev => {
      if (prev.some(w => w.productId === item.productId)) return prev;
      return [...prev, { ...item, dateAdded: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlistItems(prev => prev.filter(w => w.productId !== productId));
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.some(w => w.productId === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
