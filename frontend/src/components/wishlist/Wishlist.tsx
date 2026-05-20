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
  stockLevel?: number;
}

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return data;
};

const getEffectivePrice = (price: number, discount?: number): number =>
  discount ? price * (1 - discount) : price;

const Wishlist = () => {
  const { darkMode } = useTheme();
  const { wishlistEntries, toggleWishlist, isWishlisted, getPriceDrop } = useWishlist();
  const { data: products, isLoading, error } = useQuery('products', fetchProducts);

  const wishlistedProducts = products?.filter(p =>
    wishlistEntries.some(e => e.productId === p.productId)
  ) ?? [];

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

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
            My Wishlist
          </h1>

          {wishlistedProducts.length === 0 ? (
            <p className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your wishlist is empty — browse products to save items for later
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistedProducts.map(product => {
                const entry = wishlistEntries.find(e => e.productId === product.productId);
                if (!entry) return null;
                const currentPrice = getEffectivePrice(product.price, product.discount);
                const drop = getPriceDrop(product);
                const priceDropped = drop !== null && drop < 0;

                return (
                  <div
                    key={product.productId}
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-lg flex flex-col transition-colors duration-300`}
                  >
                    <div className={`relative h-56 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} transition-colors duration-300`}>
                      <img
                        src={`/${product.imgName}`}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all"
                        aria-label={isWishlisted(product.productId) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                      >
                        {isWishlisted(product.productId) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-grow space-y-2">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
                        {product.name}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex-grow transition-colors duration-300`}>
                        {product.description}
                      </p>

                      <div className="space-y-1 mt-auto">
                        <div className="flex items-baseline space-x-2">
                          {product.discount ? (
                            <>
                              <span className="text-gray-500 line-through text-sm">${product.price.toFixed(2)}</span>
                              <span className="text-primary text-xl font-bold">${currentPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-primary text-xl font-bold">${currentPrice.toFixed(2)}</span>
                          )}
                        </div>

                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          You saved it at ${entry.savedPrice.toFixed(2)}
                        </p>

                        {priceDropped && (
                          <p className={`text-sm font-semibold rounded px-2 py-1 ${darkMode ? 'text-green-300 bg-green-900 border border-green-700' : 'text-green-600 bg-green-50 border border-green-200'}`}>
                            Price dropped! Now ${currentPrice.toFixed(2)}
                          </p>
                        )}

                        {product.stockLevel !== undefined && product.stockLevel <= 5 && (
                          <p className="text-sm font-semibold text-red-600">
                            Low stock: only {product.stockLevel} left!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
