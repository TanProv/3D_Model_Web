import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx'; 
import { Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';
import './App.css';

// Create Auth Context
export const AuthContext = createContext();

function App() {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check existing login status
  React.useEffect(() => {
    const savedUser = localStorage.getItem('jewelry_user');
    const token = localStorage.getItem('jewelry_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email, password) => {
    // Fake login logic
    if (email === 'admin@jewelry.com' && password === 'admin123') {
      const userData = {
        email: email,
        name: 'Administrator',
        role: 'admin',
        id: 1
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Persist login state
      localStorage.setItem('jewelry_user', JSON.stringify(userData));
      localStorage.setItem('jewelry_token', 'fake_jwt_token_' + Date.now());
      
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. Access denied.' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('jewelry_user');
    localStorage.removeItem('jewelry_token');
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Header 
            cartCount={cart.length} 
            favoritesCount={favorites.length}
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
          />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>

          {/* Atelier Footer */}
          <footer className="bg-gray-950 text-white pt-20 pb-10 mt-20 border-t border-gray-900">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="space-y-6 col-span-1 md:col-span-1">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">L E G A C Y</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Fine Jewelry Atelier</p>
                  </div>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">
                    Merging traditional craftsmanship with avant-garde 3D technology to redefine luxury.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all">
                      <Instagram size={16} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all">
                      <Facebook size={16} />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all">
                      <Twitter size={16} />
                    </a>
                  </div>
                </div>

                {/* Navigation Links */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Explore</h4>
                  <ul className="space-y-4 text-sm font-light text-gray-400">
                    <li><Link to="/" className="hover:text-amber-500 transition-colors">The Maison</Link></li>
                    <li><Link to="/products" className="hover:text-amber-500 transition-colors">Collections</Link></li>
                    <li><Link to="/about" className="hover:text-amber-500 transition-colors">Philosophy</Link></li>
                    <li><Link to="/admin" className="hover:text-amber-500 transition-colors">Atelier Access</Link></li>
                  </ul>
                </div>

                {/* Services */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Services</h4>
                  <ul className="space-y-4 text-sm font-light text-gray-400">
                    <li><a href="#" className="hover:text-amber-500 transition-colors">Bespoke Design</a></li>
                    <li><a href="#" className="hover:text-amber-500 transition-colors">Restoration</a></li>
                    <li><a href="#" className="hover:text-amber-500 transition-colors">Appraisals</a></li>
                    <li><a href="#" className="hover:text-amber-500 transition-colors">Gift Cards</a></li>
                  </ul>
                </div>

                {/* Newsletter */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Newsletter</h4>
                  <p className="text-gray-400 text-xs mb-4 font-light">Subscribe to receive updates on new collections and exclusive events.</p>
                  <div className="flex border-b border-gray-800 pb-2">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="bg-transparent border-none outline-none text-sm text-white flex-grow placeholder-gray-600"
                    />
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 uppercase tracking-wider">
                <p>&copy; 2024 Legacy Jewelry. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-gray-400 transition-colors">Accessibility</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// Custom Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default App;