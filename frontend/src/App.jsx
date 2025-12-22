import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx'; 
import './App.css';

// Tạo Auth Context
export const AuthContext = createContext();

function App() {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Kiểm tra xem user đã đăng nhập trước đó chưa
  React.useEffect(() => {
    const savedUser = localStorage.getItem('jewelry_user');
    const token = localStorage.getItem('jewelry_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email, password) => {
    // Giả lập đăng nhập - thực tế sẽ gọi API
    if (email === 'admin@jewelry.com' && password === 'admin123') {
      const userData = {
        email: email,
        name: 'Admin',
        role: 'admin',
        id: 1
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Lưu thông tin đăng nhập
      localStorage.setItem('jewelry_user', JSON.stringify(userData));
      localStorage.setItem('jewelry_token', 'fake_jwt_token_' + Date.now());
      
      return { success: true };
    }
    return { success: false, message: 'Incorrect email or password' };
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
        <div className="App">
          <Header 
            cartCount={cart.length} 
            favoritesCount={favorites.length}
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
          />
          
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

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Jewelry 3D Gallery</h3>
                  <p className="text-gray-400">
                    A 3D jewelry viewing and management platform with the most advanced technology.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Quick links</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="/" className="hover:text-white transition">Home</a></li>
                    <li><a href="/products" className="hover:text-white transition">Products</a></li>
                    <li><a href="/admin" className="hover:text-white transition">Admin</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>Email: phanhuyggg@gmail.com</li>
                    <li>Hotline: 0987304977</li>
                    <li>Address: TP. Hồ Chí Minh</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Jewelry 3D Gallery. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// Custom Hook để sử dụng Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default App;