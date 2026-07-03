import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      const { data } = await api.post(endpoint, payload);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="flex h-screen w-screen justify-center items-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/80 dark:border-gray-700/50 transition-all duration-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-600 dark:text-indigo-400">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500 text-red-600 dark:text-red-300 p-3 rounded-xl mb-4 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-slate-500 dark:text-gray-400 mb-1 font-medium">Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-750 rounded-xl p-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-500 dark:text-gray-400 mb-1 font-medium">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-750 rounded-xl p-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm text-slate-500 dark:text-gray-400 mb-1 font-medium">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-750 rounded-xl p-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-550 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-500 dark:text-gray-450 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
