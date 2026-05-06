import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../../api/config';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

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
  const { isLoggedIn } = useAuth();
  const { wishlistProductIds, toggleWishlist, isWishlisted } = useWishlist();

  const { data: products, isLoading } = useQuery('products', fetchProducts);

  const wislistedProducts = (products ?? []).filter(p =>
    wishlistProductIds.has(p.productId)
  );

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

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>My Wishlist</h1>

          {!isLoggedIn || wislistedProducts.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-16 transition-colors duration-300`}>
              Your wishlist is empty — browse products to save items for later
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wislistedProducts.map(product => (
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
                      className="absolute top-2 right-2 p-1 rounded-full bg-white/70 hover:bg-white transition-colors"
                      onClick={() => toggleWishlist(product.productId)}
                      aria-label={isWishlisted(product.productId) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${isWishlisted(product.productId) ? 'text-primary fill-primary' : 'text-gray-400 fill-none'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
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
