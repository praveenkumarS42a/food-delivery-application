import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_GATEWAY}/auth/login`, { email, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-slate-400 mb-8">Sign in to continue your delicious journey.</p>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-medium border border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="email" placeholder="Email Address" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="password" placeholder="Password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-orange-400 hover:text-orange-300 font-bold hover:underline">
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
