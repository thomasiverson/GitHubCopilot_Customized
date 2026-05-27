import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Welcome from './components/Welcome';
import About from './components/About';
import Footer from './components/Footer';
import Products from './components/entity/product/Products';
import Wishlist from './components/Wishlist';
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import AdminProducts from './components/admin/AdminProducts';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Wrapper component to apply theme classes
function ThemedApp() {
  const { darkMode } = useTheme();
  const { isLoggedIn } = useAuth();
  
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
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route
              path="/wishlist"
              element={isLoggedIn ? <Wishlist /> : <Navigate to="/login?error=Please log in to view your wishlist" replace />}
            />
          </Routes>
        </main>
        <Footer />
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
