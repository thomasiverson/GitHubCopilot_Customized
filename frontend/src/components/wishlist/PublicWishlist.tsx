import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/config';

interface WishlistItem {
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

interface WishlistCollection {
    collectionId: number;
    userId: number;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
    sharedToken?: string;
}

interface SharedWishlistData {
    collection: WishlistCollection;
    items: WishlistItem[];
    products: Product[];
}

export default function PublicWishlist() {
    const { token } = useParams<{ token: string }>();
    const { darkMode } = useTheme();

    const { data, isLoading, error } = useQuery<SharedWishlistData>(
        ['sharedWishlist', token],
        async () => {
            const { data } = await axios.get(`${api.baseURL}${api.endpoints.wishlistShared(token || '')}`);
            return data;
        },
        { enabled: !!token }
    );

    if (isLoading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-12 text-center shadow-md`}>
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-700'} mb-2`}>
                            Wishlist Not Found
                        </h2>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                            This wishlist is either private or no longer available.
                        </p>
                        <Link
                            to="/"
                            className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { collection, items, products } = data;
    const getProduct = (productId: number) => products.find(p => p.productId === productId);

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className={`inline-flex items-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-green-50'} px-3 py-1 rounded-full text-sm mb-3`}>
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-green-700'}`}>Public Wishlist</span>
                    </div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                            {collection.description}
                        </p>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-12 text-center shadow-md`}>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            This wishlist is empty.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => {
                            const product = getProduct(item.productId);
                            if (!product) return null;
                            const currentPrice = product.discount
                                ? product.price * (1 - product.discount)
                                : product.price;

                            return (
                                <div
                                    key={item.wishlistItemId}
                                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}
                                >
                                    <div className={`h-48 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'}`}>
                                        <img
                                            src={`/${product.imgName}`}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <h3 className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                                            {product.name}
                                        </h3>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                                            {product.description}
                                        </p>
                                        {item.notes && (
                                            <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                "{item.notes}"
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-primary font-bold">${currentPrice.toFixed(2)}</span>
                                            <Link
                                                to="/products"
                                                className="text-sm bg-primary hover:bg-accent text-white px-3 py-1.5 rounded-md transition-colors"
                                            >
                                                View on OctoCAT Supply
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
