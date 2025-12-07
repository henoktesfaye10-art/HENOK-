import React, { useState } from 'react';
import { db } from '../services/db';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Mock password for demo
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock Authentication Logic
    const user = await db.login(username);
    
    // In a real app, password check would happen here
    if (user && password.length > 0) {
      onLoginSuccess(user);
    } else {
      setError('Invalid username or password. (Hint: Try "student1", "student2" or "admin" with any password)');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-green-600 p-8 text-center">
        <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-3xl shadow-inner mb-4">
          🦎
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
        <p className="text-green-100">Log in to track your progress</p>
      </div>
      
      <div className="p-8">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="e.g. student1"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="••••••••"
              required 
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Demo Login:</p>
          <p>Student: <strong>student1</strong> | Teacher: <strong>admin</strong></p>
          <p>Any password works</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
