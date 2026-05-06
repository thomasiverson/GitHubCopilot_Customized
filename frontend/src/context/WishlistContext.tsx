import { createContext, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../api/config';

export interface WishlistCollection {
    collectionId: number;
    userId: number;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
    sharedToken?: string;
}

export interface WishlistItem {
    wishlistItemId: number;
    userId: number;
    productId: number;
    collectionId: number | null;
    dateAdded: string;
    notes: string;
    priceWhenAdded: number;
    notifyOnPriceDrop: boolean;
    notifyOnStockAvailable: boolean;
}

export interface WishlistNotification {
    notificationId: number;
    userId: number;
    type: 'price_drop' | 'stock_available';
    productId: number;
    wishlistItemId: number;
    message: string;
    isRead: boolean;
    createdAt: string;
    oldPrice?: number;
    newPrice?: number;
}

interface WishlistContextType {
    // Collections
    collections: WishlistCollection[];
    collectionsLoading: boolean;
    getCollections: () => void;
    createCollection: (data: { name: string; description: string; isPublic: boolean }) => Promise<WishlistCollection>;
    updateCollection: (collectionId: number, data: Partial<WishlistCollection>) => Promise<WishlistCollection>;
    deleteCollection: (collectionId: number) => Promise<void>;
    // Items
    addToWishlist: (data: {
        productId: number;
        collectionId?: number | null;
        notes?: string;
        notifyOnPriceDrop?: boolean;
        notifyOnStockAvailable?: boolean;
    }) => Promise<WishlistItem>;
    moveItemToCollection: (itemId: number, collectionId: number | null) => Promise<WishlistItem>;
    updateItemNotes: (itemId: number, notes: string) => Promise<WishlistItem>;
    togglePriceAlert: (itemId: number, current: boolean) => Promise<WishlistItem>;
    toggleStockAlert: (itemId: number, current: boolean) => Promise<WishlistItem>;
    removeItem: (itemId: number) => Promise<void>;
    // Sharing
    generateShareLink: (collectionId: number) => Promise<string>;
    revokeSharing: (collectionId: number) => Promise<void>;
    // Notifications
    notifications: WishlistNotification[];
    notificationsLoading: boolean;
    getNotifications: () => void;
    dismissNotification: (notificationId: number) => Promise<void>;
    // User
    userId: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

// Mock userId for demo purposes (in a real app, this would come from AuthContext)
const DEMO_USER_ID = 1;

export function WishlistProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const userId = DEMO_USER_ID;

    // Collections query
    const { data: collections = [], isLoading: collectionsLoading, refetch: getCollections } = useQuery<WishlistCollection[]>(
        ['wishlistCollections', userId],
        async () => {
            const { data } = await axios.get(`${api.baseURL}${api.endpoints.wishlistCollections(userId)}`);
            return data;
        }
    );

    // Notifications query
    const { data: notifications = [], isLoading: notificationsLoading, refetch: getNotifications } = useQuery<WishlistNotification[]>(
        ['wishlistNotifications', userId],
        async () => {
            const { data } = await axios.get(`${api.baseURL}${api.endpoints.wishlistNotifications(userId)}`);
            return data;
        }
    );

    // Create collection
    const createCollectionMutation = useMutation(
        async (data: { name: string; description: string; isPublic: boolean }) => {
            const response = await axios.post(`${api.baseURL}${api.endpoints.wishlistCollections(userId)}`, data);
            return response.data as WishlistCollection;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['wishlistCollections', userId]);
            }
        }
    );

    // Update collection
    const updateCollectionMutation = useMutation(
        async ({ collectionId, data }: { collectionId: number; data: Partial<WishlistCollection> }) => {
            const response = await axios.put(
                `${api.baseURL}${api.endpoints.wishlistCollections(userId)}/${collectionId}`,
                data
            );
            return response.data as WishlistCollection;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['wishlistCollections', userId]);
            }
        }
    );

    // Delete collection
    const deleteCollectionMutation = useMutation(
        async (collectionId: number) => {
            await axios.delete(`${api.baseURL}${api.endpoints.wishlistCollections(userId)}/${collectionId}`);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['wishlistCollections', userId]);
            }
        }
    );

    // Add to wishlist
    const addToWishlistMutation = useMutation(
        async (data: {
            productId: number;
            collectionId?: number | null;
            notes?: string;
            notifyOnPriceDrop?: boolean;
            notifyOnStockAvailable?: boolean;
        }) => {
            const response = await axios.post(`${api.baseURL}${api.endpoints.wishlistItems(userId)}`, data);
            return response.data as WishlistItem;
        },
        {
            onSuccess: (_data, variables) => {
                if (variables.collectionId) {
                    queryClient.invalidateQueries(['wishlistCollectionItems', userId, variables.collectionId]);
                }
            }
        }
    );

    // Update item
    const updateItemMutation = useMutation(
        async ({ itemId, data }: { itemId: number; data: Partial<WishlistItem> }) => {
            const response = await axios.put(
                `${api.baseURL}${api.endpoints.wishlistItems(userId)}/${itemId}`,
                data
            );
            return response.data as WishlistItem;
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(['wishlistCollectionItems', userId, data.collectionId]);
            }
        }
    );

    // Remove item
    const removeItemMutation = useMutation(
        async (itemId: number) => {
            await axios.delete(`${api.baseURL}${api.endpoints.wishlistItems(userId)}/${itemId}`);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['wishlistCollections', userId]);
            }
        }
    );

    // Generate share link
    const generateShareLinkMutation = useMutation(
        async (collectionId: number) => {
            const response = await axios.post(`${api.baseURL}${api.endpoints.wishlistShare(userId, collectionId)}`);
            return response.data.sharedToken as string;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['wishlistCollections', userId]);
            }
        }
    );

    // Revoke sharing
    const revokeSharingMutation = useMutation(
        async (collectionId: number) => {
            await axios.delete(`${api.baseURL}${api.endpoints.wishlistShare(userId, collectionId)}`);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['wishlistCollections', userId]);
            }
        }
    );

    // Dismiss notification
    const dismissNotificationMutation = useMutation(
        async (notificationId: number) => {
            await axios.post(`${api.baseURL}${api.endpoints.dismissNotification(userId, notificationId)}`);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['wishlistNotifications', userId]);
            }
        }
    );

    const value: WishlistContextType = {
        collections,
        collectionsLoading,
        getCollections,
        createCollection: (data) => createCollectionMutation.mutateAsync(data),
        updateCollection: (collectionId, data) => updateCollectionMutation.mutateAsync({ collectionId, data }),
        deleteCollection: (collectionId) => deleteCollectionMutation.mutateAsync(collectionId),
        addToWishlist: (data) => addToWishlistMutation.mutateAsync(data),
        moveItemToCollection: (itemId, collectionId) =>
            updateItemMutation.mutateAsync({ itemId, data: { collectionId } }),
        updateItemNotes: (itemId, notes) =>
            updateItemMutation.mutateAsync({ itemId, data: { notes } }),
        togglePriceAlert: (itemId, current) =>
            updateItemMutation.mutateAsync({ itemId, data: { notifyOnPriceDrop: !current } }),
        toggleStockAlert: (itemId, current) =>
            updateItemMutation.mutateAsync({ itemId, data: { notifyOnStockAvailable: !current } }),
        removeItem: (itemId) => removeItemMutation.mutateAsync(itemId),
        generateShareLink: (collectionId) => generateShareLinkMutation.mutateAsync(collectionId),
        revokeSharing: (collectionId) => revokeSharingMutation.mutateAsync(collectionId),
        notifications,
        notificationsLoading,
        getNotifications,
        dismissNotification: (notificationId) => dismissNotificationMutation.mutateAsync(notificationId),
        userId
    };

    return (
        <WishlistContext.Provider value={value}>
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
