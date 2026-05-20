import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../../api/config';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';

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
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return data;
};

export default function Wishlist() {
  const { darkMode } = useTheme();
  const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();
  const { data: products, isLoading, error } = useQuery('products', fetchProducts);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center">Failed to fetch products</div>
        </div>
      </div>
    );
  }

  const wishlistedProducts = products?.filter(p => wishlistIds.has(p.productId)) ?? [];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>Wishlist</h1>

          {wishlistedProducts.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-16 transition-colors duration-300`}>
              Your wishlist is empty — browse products to save items for later
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistedProducts.map(product => (
                <div key={product.productId} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(118,184,82,0.3)] flex flex-col`}>
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
                      className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 shadow"
                      onClick={() => toggleWishlist(product.productId)}
                      aria-label={isWishlisted(product.productId) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                    >
                      {isWishlisted(product.productId) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2 transition-colors duration-300`}>{product.name}</h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 flex-grow transition-colors duration-300`}>{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      {product.discount ? (
                        <div>
                          <span className="text-gray-500 line-through text-sm mr-2">${product.price.toFixed(2)}</span>
                          <span className="text-primary text-xl font-bold">${(product.price * (1 - product.discount)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-primary text-xl font-bold">${product.price.toFixed(2)}</span>
                      )}
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
