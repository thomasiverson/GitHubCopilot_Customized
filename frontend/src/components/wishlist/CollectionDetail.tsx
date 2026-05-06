import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useWishlist, WishlistItem } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/config';
import AddToWishlistModal from './AddToWishlistModal';

interface Product {
    productId: number;
    name: string;
    description: string;
    price: number;
    imgName: string;
    sku: string;
    unit: string;
    supplierId: number;
    discount?: number;
}

interface CollectionData {
    items: WishlistItem[];
    products: Product[];
}

export default function CollectionDetail() {
    const { collectionId } = useParams<{ collectionId: string }>();
    const numericCollectionId = parseInt(collectionId || '0');
    const { darkMode } = useTheme();
    const {
        collections,
        moveItemToCollection,
        updateItemNotes,
        togglePriceAlert,
        toggleStockAlert,
        removeItem,
        userId
    } = useWishlist();

    const [editingNotes, setEditingNotes] = useState<number | null>(null);
    const [notesDraft, setNotesDraft] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const collection = collections.find(c => c.collectionId === numericCollectionId);

    const { data, isLoading, refetch } = useQuery<CollectionData>(
        ['wishlistCollectionItems', userId, numericCollectionId],
        async () => {
            const { data } = await axios.get(
                `${api.baseURL}${api.endpoints.wishlistCollectionItems(userId, numericCollectionId)}`
            );
            return data;
        }
    );

    const items = data?.items || [];
    const products = data?.products || [];

    const getProduct = (productId: number) => products.find(p => p.productId === productId);

    const handleSaveNotes = async (item: WishlistItem) => {
        try {
            await updateItemNotes(item.wishlistItemId, notesDraft);
            setEditingNotes(null);
            refetch();
        } catch (e) {
            console.error('Failed to update notes', e);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (confirm('Remove this item from your wishlist?')) {
            try {
                await removeItem(itemId);
                refetch();
            } catch (e) {
                console.error('Failed to remove item', e);
            }
        }
    };

    const handleMoveItem = async (itemId: number, targetCollectionId: number | null) => {
        try {
            await moveItemToCollection(itemId, targetCollectionId);
            refetch();
        } catch (e) {
            console.error('Failed to move item', e);
        }
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/wishlist"
                        className={`text-sm ${darkMode ? 'text-gray-400 hover:text-light' : 'text-gray-500 hover:text-gray-700'} flex items-center mb-3 transition-colors`}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Wishlists
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                                {collection?.name || 'Collection'}
                            </h1>
                            {collection?.description && (
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                    {collection.description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Item</span>
                        </button>
                    </div>
                </div>

                {/* Items Grid */}
                {items.length === 0 ? (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-12 text-center shadow-md`}>
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-700'} mb-2`}>
                            This collection is empty
                        </h2>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                            Browse products and add them to this collection.
                        </p>
                        <Link
                            to="/products"
                            className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => {
                            const product = getProduct(item.productId);
                            if (!product) return null;
                            const currentPrice = product.discount
                                ? product.price * (1 - product.discount)
                                : product.price;
                            const priceDrop = currentPrice < item.priceWhenAdded;
                            const priceDropPct = priceDrop
                                ? Math.round(((item.priceWhenAdded - currentPrice) / item.priceWhenAdded) * 100)
                                : 0;

                            return (
                                <div
                                    key={item.wishlistItemId}
                                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}
                                >
                                    {/* Product image */}
                                    <div className={`relative h-48 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'}`}>
                                        <img
                                            src={`/${product.imgName}`}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                        {priceDrop && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                Price Drop! -{priceDropPct}%
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <h3 className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                                            {product.name}
                                        </h3>

                                        {/* Price info */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-primary font-bold">${currentPrice.toFixed(2)}</span>
                                            {priceDrop && (
                                                <span className={`text-sm line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    ${item.priceWhenAdded.toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {editingNotes === item.wishlistItemId ? (
                                            <div>
                                                <textarea
                                                    value={notesDraft}
                                                    onChange={e => setNotesDraft(e.target.value)}
                                                    className={`w-full text-sm px-2 py-1 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-light' : 'bg-gray-50 border-gray-300 text-gray-800'} focus:outline-none focus:border-primary`}
                                                    rows={2}
                                                    placeholder="Add notes..."
                                                />
                                                <div className="flex space-x-2 mt-1">
                                                    <button
                                                        onClick={() => handleSaveNotes(item)}
                                                        className="text-xs text-primary hover:text-accent"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingNotes(null)}
                                                        className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingNotes(item.wishlistItemId);
                                                    setNotesDraft(item.notes);
                                                }}
                                                className={`text-sm text-left w-full ${item.notes ? (darkMode ? 'text-gray-300' : 'text-gray-600') : (darkMode ? 'text-gray-500 italic' : 'text-gray-400 italic')} hover:text-primary transition-colors`}
                                            >
                                                {item.notes || '+ Add notes'}
                                            </button>
                                        )}

                                        {/* Notification toggles */}
                                        <div className="space-y-1">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.notifyOnPriceDrop}
                                                    onChange={() => togglePriceAlert(item.wishlistItemId, item.notifyOnPriceDrop).then(() => refetch())}
                                                    className="rounded text-primary"
                                                />
                                                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    Notify on price drop
                                                </span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.notifyOnStockAvailable}
                                                    onChange={() => toggleStockAlert(item.wishlistItemId, item.notifyOnStockAvailable).then(() => refetch())}
                                                    className="rounded text-primary"
                                                />
                                                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    Notify when back in stock
                                                </span>
                                            </label>
                                        </div>

                                        {/* Move to collection */}
                                        {collections.length > 1 && (
                                            <select
                                                value={item.collectionId ?? ''}
                                                onChange={e => handleMoveItem(item.wishlistItemId, e.target.value ? parseInt(e.target.value) : null)}
                                                className={`w-full text-xs px-2 py-1 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-light' : 'bg-gray-50 border-gray-300 text-gray-700'} focus:outline-none focus:border-primary`}
                                            >
                                                <option value="">Move to collection...</option>
                                                {collections
                                                    .filter(c => c.collectionId !== numericCollectionId)
                                                    .map(c => (
                                                        <option key={c.collectionId} value={c.collectionId}>
                                                            {c.name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex space-x-2">
                                            <Link
                                                to="/products"
                                                className="flex-1 text-center text-sm py-1.5 rounded-md bg-primary hover:bg-accent text-white transition-colors"
                                            >
                                                View Product
                                            </Link>
                                            <button
                                                onClick={() => handleRemoveItem(item.wishlistItemId)}
                                                className={`text-sm py-1.5 px-3 rounded-md border ${darkMode ? 'border-gray-600 text-red-400 hover:bg-red-900/20' : 'border-gray-300 text-red-500 hover:bg-red-50'} transition-colors`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddToWishlistModal
                    onClose={() => setShowAddModal(false)}
                    defaultCollectionId={numericCollectionId}
                    onAdded={() => refetch()}
                />
            )}
        </div>
    );
}
