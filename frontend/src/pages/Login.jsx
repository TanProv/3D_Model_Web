import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import { ArrowLeft, Lock, Loader2, AlertCircle } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for effect
    setTimeout(() => {
        const result = login(email, password);
        
        if (result.success) {
          navigate('/admin');
        } else {
          setError(result.message || 'Authentication failed');
        }
        setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-gray-900">
      <div className="max-w-md w-full space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft size={14} /> Return to Atelier
          </Link>
          
          <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl">
            <Lock size={32} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-serif">Atelier Access</h1>
            <p className="text-gray-500 text-sm font-light">Authenticate to manage the digital collection.</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-2xl space-y-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-medium">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="ml-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  Identity
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-gray-300"
                  placeholder="admin@jewelry.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="ml-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  Passphrase
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-950 text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Authenticating...
                </>
              ) : 'Enter Atelier'}
            </button>
          </form>

          {/* Default Credentials Hint (Styled minimally) */}
          <div className="pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Demo Credentials</p>
            <div className="flex flex-col gap-2 text-xs text-gray-500 font-mono bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between">
                <span>User:</span>
                <span className="text-gray-900">admin@jewelry.com</span>
              </div>
              <div className="flex justify-between">
                <span>Pass:</span>
                <span className="text-gray-900">admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;