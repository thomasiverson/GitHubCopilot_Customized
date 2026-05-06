import { useQuery } from 'react-query';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
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
  const { darkMode } = useTheme();
  const { isLoggedIn } = useAuth();
  const { wishlistItems, isLoading: wishlistLoading, error: wishlistError, removeFromWishlist } = useWishlist();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>(
    'products',
    fetchProducts
  );

  const isLoading = wishlistLoading || productsLoading;

  const wishlistProducts = wishlistItems
    .map(item => products.find(p => p.productId === item.productId))
    .filter((p): p is Product => p !== undefined);

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-64">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Please log in to view your wishlist</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center">Failed to load wishlist. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
            My Wishlist
            {wishlistProducts.length > 0 && (
              <span className="ml-3 text-lg font-normal text-primary">({wishlistProducts.length} items)</span>
            )}
          </h1>

          {wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="w-20 h-20 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Your wishlist is empty</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Browse products and click the heart icon to save items here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map(product => (
                <div
                  key={product.productId}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(118,184,82,0.3)] flex flex-col`}
                >
                  <div className={`relative h-56 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} transition-colors duration-300`}>
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
                    <button
                      onClick={() => removeFromWishlist(product.productId)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-700/80 text-red-500 hover:text-red-600 transition-colors"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2 transition-colors duration-300`}>
                      {product.name}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 flex-grow text-sm transition-colors duration-300`}>
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      {product.discount ? (
                        <div>
                          <span className="text-gray-500 line-through text-sm mr-2">${product.price.toFixed(2)}</span>
                          <span className="text-primary text-xl font-bold">${(product.price * (1 - product.discount)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-primary text-xl font-bold">${product.price.toFixed(2)}</span>
                      )}
                      <button
                        onClick={() => removeFromWishlist(product.productId)}
                        className={`px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'} transition-colors`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
