import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/config';

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

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get<Product[]>(`${api.baseURL}${api.endpoints.products}`);
  return data;
};

export default function Wishlist() {
  const { isLoggedIn } = useAuth();
  const { wishlistProductIds, removeFromWishlist, isLoading } = useWishlist();
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>(
    'products',
    fetchProducts
  );

  const wishlistProducts = allProducts.filter((p) =>
    wishlistProductIds.includes(p.productId)
  );

  const filteredProducts = wishlistProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId: number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const handleAddToCart = (productId: number) => {
    const quantity = quantities[productId] || 0;
    if (quantity > 0) {
      alert(`Added ${quantity} items to cart`);
      setQuantities((prev) => ({ ...prev, [productId]: 0 }));
    }
  };

  const loading = isLoading || productsLoading;

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1
              className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              My Wishlist
            </h1>
            {!isLoggedIn && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <a href="/login" className="text-primary hover:underline">
                  Log in
                </a>{' '}
                to save your wishlist permanently
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <svg
                className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p
                className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Your wishlist is empty. Browse{' '}
                <a href="/products" className="text-primary hover:underline">
                  products
                </a>{' '}
                to add items!
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 ${
                    darkMode
                      ? 'bg-gray-800 text-light border-gray-700'
                      : 'bg-white text-gray-800 border-gray-300'
                  } rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                  aria-label="Search wishlist"
                />
                <svg
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.productId}
                    className={`${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg overflow-hidden shadow-lg flex flex-col transition-colors duration-300`}
                  >
                    <div
                      className={`relative h-48 ${
                        darkMode
                          ? 'bg-gradient-to-t from-gray-700 to-gray-800'
                          : 'bg-gradient-to-t from-gray-100 to-white'
                      }`}
                    >
                      <img
                        src={`/${product.imgName}`}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                      {product.discount && (
                        <div className="absolute top-8 left-0 bg-primary text-white px-3 py-1 -rotate-90 transform -translate-x-5 shadow-md">
                          {Math.round(product.discount * 100)}% OFF
                        </div>
                      )}
                      {/* Remove from wishlist button */}
                      <button
                        onClick={() => removeFromWishlist(product.productId)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                        aria-label={`Remove ${product.name} from wishlist`}
                        title="Remove from wishlist"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h3
                        className={`text-lg font-semibold ${
                          darkMode ? 'text-light' : 'text-gray-800'
                        } mb-2 transition-colors duration-300`}
                      >
                        {product.name}
                      </h3>
                      <p
                        className={`${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        } text-sm mb-4 flex-grow transition-colors duration-300 line-clamp-2`}
                      >
                        {product.description}
                      </p>
                      <div className="space-y-3 mt-auto">
                        <div className="flex justify-between items-center">
                          {product.discount ? (
                            <div>
                              <span className="text-gray-500 line-through text-sm mr-2">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-primary text-lg font-bold">
                                ${(product.price * (1 - product.discount)).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-primary text-lg font-bold">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex items-center space-x-2 ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            } rounded-lg p-1 transition-colors duration-300`}
                          >
                            <button
                              onClick={() => handleQuantityChange(product.productId, -1)}
                              className={`w-7 h-7 flex items-center justify-center ${
                                darkMode ? 'text-light' : 'text-gray-700'
                              } hover:text-primary transition-colors`}
                              aria-label={`Decrease quantity of ${product.name}`}
                            >
                              <span aria-hidden="true">-</span>
                            </button>
                            <span
                              className={`${
                                darkMode ? 'text-light' : 'text-gray-800'
                              } min-w-[1.5rem] text-center`}
                            >
                              {quantities[product.productId] || 0}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(product.productId, 1)}
                              className={`w-7 h-7 flex items-center justify-center ${
                                darkMode ? 'text-light' : 'text-gray-700'
                              } hover:text-primary transition-colors`}
                              aria-label={`Increase quantity of ${product.name}`}
                            >
                              <span aria-hidden="true">+</span>
                            </button>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product.productId)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              quantities[product.productId]
                                ? 'bg-primary hover:bg-accent text-white'
                                : `${
                                    darkMode
                                      ? 'bg-gray-700 text-gray-400'
                                      : 'bg-gray-200 text-gray-500'
                                  } cursor-not-allowed`
                            }`}
                            disabled={!quantities[product.productId]}
                            aria-label={`Add ${quantities[product.productId] || 0} ${product.name} to cart`}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
