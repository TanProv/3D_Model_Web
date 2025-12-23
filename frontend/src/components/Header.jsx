import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { AuthContext } from '../App.jsx';

function Header({ cartCount, favoritesCount }) {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        
        {/* Left: Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-12">
          <Link to="/" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-black transition-colors">
            Atelier
          </Link>
          <Link to="/products" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-black transition-colors">
            Collections
          </Link>
          <Link to="/about" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-black transition-colors">
            Philosophy
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-black"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 group">
          <div className="flex flex-col items-center">
            <h1 className="font-serif text-2xl md:text-3xl tracking-tight text-gray-900 group-hover:text-amber-600 transition-colors duration-500">
              L E G A C Y
            </h1>
            <span className="text-[8px] uppercase tracking-[0.4em] text-gray-400 group-hover:tracking-[0.6em] transition-all duration-500">
              Fine Jewelry
            </span>
          </div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center space-x-6">
          {/* Search */}
          <button className="text-gray-400 hover:text-amber-600 transition-colors p-2 hidden sm:block">
            <Search size={20} strokeWidth={1.5} />
          </button>

          {/* User Account */}
          <div className="relative group">
            <button className="text-gray-400 hover:text-amber-600 transition-colors p-2">
              <User size={20} strokeWidth={1.5} />
            </button>
            
            {/* User Dropdown */}
            <div className="absolute right-0 top-full mt-4 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
              {isAuthenticated ? (
                <div className="p-2">
                  <div className="px-4 py-3 border-b border-gray-50 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Welcome</p>
                    <p className="font-serif text-gray-900">{user?.name}</p>
                  </div>
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                    <Sparkles size={16} /> Admin Suite
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-left">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <p className="text-center text-xs text-gray-500">Access your digital atelier.</p>
                  <Link to="/login" className="block w-full bg-black text-white py-3 rounded-full text-[10px] font-bold uppercase tracking-widest text-center hover:bg-amber-600 transition-colors shadow-lg">
                    Authenticate
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Favorites */}
          <Link to="/favorites" className="relative text-gray-400 hover:text-amber-600 transition-colors p-2">
            <Heart size={20} strokeWidth={1.5} />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative text-gray-400 hover:text-amber-600 transition-colors p-2">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col p-6 space-y-6">
             <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-gray-900">Homepage</Link>
             <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-gray-900">Collections</Link>
             <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-gray-900">Philosophy</Link>
             <div className="h-px bg-gray-100 w-full"></div>
             <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-amber-600">Admin Suite</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;