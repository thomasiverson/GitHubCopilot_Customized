import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const filteredItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId: number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change)
    }));
  };

  const handleAddToCart = (productId: number, name: string) => {
    const quantity = quantities[productId] || 0;
    if (quantity > 0) {
      // TODO: Implement cart functionality
      alert(`Added ${quantity} ${name} to cart`);
      setQuantities(prev => ({ ...prev, [productId]: 0 }));
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>My Wishlist</h1>

          {wishlistItems.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-24 space-y-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className="w-20 h-20 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-xl font-medium">Your wishlist is empty</p>
              <p className="text-sm">Browse products and click the heart icon to save items here.</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-800 text-light border-gray-700' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                  aria-label="Search wishlist"
                />
                <svg
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {filteredItems.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No items match your search.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map(item => (
                    <div key={item.productId} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(118,184,82,0.3)] flex flex-col`}>
                      <div className={`relative h-56 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} transition-colors duration-300`}>
                        <img
                          src={`/${item.imgName}`}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                        {item.discount && (
                          <div className="absolute top-8 left-0 bg-primary text-white px-3 py-1 -rotate-90 transform -translate-x-5 shadow-md">
                            {Math.round(item.discount * 100)}% OFF
                          </div>
                        )}
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-red-500 hover:text-red-600 shadow transition-colors duration-200"
                          aria-label={`Remove ${item.name} from wishlist`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2 transition-colors duration-300`}>{item.name}</h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 flex-grow transition-colors duration-300`}>{item.description}</p>
                        <div className="space-y-4 mt-auto">
                          <div className="flex justify-between items-center">
                            {item.discount ? (
                              <div>
                                <span className="text-gray-500 line-through text-sm mr-2">${item.price.toFixed(2)}</span>
                                <span className="text-primary text-xl font-bold">${(item.price * (1 - item.discount)).toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-primary text-xl font-bold">${item.price.toFixed(2)}</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1 transition-colors duration-300`}>
                              <button
                                onClick={() => handleQuantityChange(item.productId, -1)}
                                className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <span aria-hidden="true">-</span>
                              </button>
                              <span
                                className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center transition-colors duration-300`}
                                aria-label={`Quantity of ${item.name}`}
                              >
                                {quantities[item.productId] || 0}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, 1)}
                                className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <span aria-hidden="true">+</span>
                              </button>
                            </div>
                            <button
                              onClick={() => handleAddToCart(item.productId, item.name)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                quantities[item.productId]
                                  ? 'bg-primary hover:bg-accent text-white'
                                  : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                              }`}
                              disabled={!quantities[item.productId]}
                              aria-label={`Add ${quantities[item.productId] || 0} ${item.name} to cart`}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
