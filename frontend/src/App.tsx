import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Welcome from './components/Welcome';
import About from './components/About';
import Footer from './components/Footer';
import Products from './components/entity/product/Products';
import Login from './components/Login';
import Wishlist from './components/Wishlist';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import AdminProducts from './components/admin/AdminProducts';
import { useTheme } from './context/ThemeContext';
import { useWishlist } from './context/WishlistContext';
import { useEffect } from 'react';

// Toast notification that shows merge messages
function WishlistToast() {
  const { toastMessage, clearToast } = useWishlist();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(clearToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in">
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span>{toastMessage}</span>
      <button onClick={clearToast} className="ml-2 hover:opacity-75" aria-label="Dismiss notification">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Wrapper component to apply theme classes
function ThemedApp() {
  const { darkMode } = useTheme();
  
  return (
    <Router>
      <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} transition-colors duration-300`}>
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin/products" element={<AdminProducts />} />
          </Routes>
        </main>
        <Footer />
        <WishlistToast />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WishlistProvider>
          <ThemedApp />
        </WishlistProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
