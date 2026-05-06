import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/config';

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

interface AddToWishlistModalProps {
    onClose: () => void;
    defaultCollectionId?: number | null;
    preselectedProduct?: Product;
    onAdded?: () => void;
}

export default function AddToWishlistModal({
    onClose,
    defaultCollectionId,
    preselectedProduct,
    onAdded
}: AddToWishlistModalProps) {
    const { collections, addToWishlist } = useWishlist();
    const { darkMode } = useTheme();

    const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(defaultCollectionId ?? null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(preselectedProduct?.productId ?? null);
    const [notes, setNotes] = useState('');
    const [notifyOnPriceDrop, setNotifyOnPriceDrop] = useState(false);
    const [notifyOnStockAvailable, setNotifyOnStockAvailable] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: products } = useQuery<Product[]>(
        'products',
        async () => {
            const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}`);
            return data;
        },
        { enabled: !preselectedProduct }
    );

    const displayProducts = preselectedProduct ? [preselectedProduct] : (products || []);

    const handleAdd = async () => {
        if (!selectedProductId) return;
        setLoading(true);
        try {
            await addToWishlist({
                productId: selectedProductId,
                collectionId: selectedCollectionId,
                notes,
                notifyOnPriceDrop,
                notifyOnStockAvailable
            });
            onAdded?.();
            onClose();
        } catch (e) {
            console.error('Failed to add to wishlist', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`${darkMode ? 'bg-gray-800 text-light' : 'bg-white text-gray-800'} rounded-lg p-6 max-w-md w-full shadow-xl`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Add to Wishlist</h2>
                    <button
                        onClick={onClose}
                        className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Product selection */}
                    {preselectedProduct ? (
                        <div className={`flex items-center space-x-3 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <img
                                src={`/${preselectedProduct.imgName}`}
                                alt={preselectedProduct.name}
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <p className={`font-medium text-sm ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                                    {preselectedProduct.name}
                                </p>
                                <p className="text-primary text-sm font-bold">
                                    ${preselectedProduct.price.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Product *
                            </label>
                            <select
                                value={selectedProductId ?? ''}
                                onChange={e => setSelectedProductId(e.target.value ? parseInt(e.target.value) : null)}
                                className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-light' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:border-primary`}
                            >
                                <option value="">Select a product...</option>
                                {displayProducts.map(p => (
                                    <option key={p.productId} value={p.productId}>
                                        {p.name} - ${p.price.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Collection selection */}
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Collection
                        </label>
                        <select
                            value={selectedCollectionId ?? ''}
                            onChange={e => setSelectedCollectionId(e.target.value ? parseInt(e.target.value) : null)}
                            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-light' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:border-primary`}
                        >
                            <option value="">Default (no collection)</option>
                            {collections.map(c => (
                                <option key={c.collectionId} value={c.collectionId}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-light' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:border-primary`}
                            rows={2}
                            placeholder="Optional notes..."
                        />
                    </div>

                    {/* Notification options */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifyOnPriceDrop}
                                onChange={e => setNotifyOnPriceDrop(e.target.checked)}
                                className="rounded text-primary"
                            />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Notify me of price drops (10%+ discount)
                            </span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifyOnStockAvailable}
                                onChange={e => setNotifyOnStockAvailable(e.target.checked)}
                                className="rounded text-primary"
                            />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Notify me when back in stock
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-md text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedProductId || loading}
                        className="px-4 py-2 rounded-md text-sm bg-primary hover:bg-accent text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Add to Wishlist</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
