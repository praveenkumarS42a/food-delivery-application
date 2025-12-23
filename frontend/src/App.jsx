import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChefHat, Clock, CheckCircle, AlertCircle, Loader2, LogOut, User, Navigation, UtensilsCrossed } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';
import Payment from './Payment';
import OrderHistory from './OrderHistory';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [page, setPage] = useState('menu'); // menu, signup, login, payment, orders

  // Dashboard State
  const [menu, setMenu] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Checkout State
  const [checkoutItem, setCheckoutItem] = useState(null);

  useEffect(() => {
    if (token) {
      if (page === 'login' || page === 'signup') setPage('menu');
      fetchMenu();
    } else {
      setPage('login');
    }
  }, [token]);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPage('login');
  };

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_GATEWAY}/menu`);
      setMenu(res.data);
    } catch (err) {
      showNotification('Failed to load menu. Is backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initiateOrder = (item, price) => {
    setCheckoutItem({ item, price });
    setPage('payment');
  };

  const finalizeOrder = async (paymentData) => {
    const orderId = Math.floor(Math.random() * 10000); // Temporary ID
    const newOrder = { id: orderId, items: [checkoutItem.item], status: 'Pending' };

    setOrders([newOrder, ...orders]);
    setPage('menu'); // Go back to menu while processing, or we could stay on a "Processing" screen

    try {
      showNotification(`Placing order for ${checkoutItem.item}...`, 'info');
      const payload = {
        items: [checkoutItem.item],
        user_id: user?.id,
        payment: paymentData,
        timestamp: new Date().toISOString()
      };
      const res = await axios.post(`${API_GATEWAY}/orders`, payload);

      const realId = res.data.orderId || orderId;
      updateOrderStatus(orderId, 'Accepted', res.data.handledBy, realId);
      showNotification(`Order accepted by ${res.data.handledBy}`, 'success');

      setTimeout(() => updateOrderStatus(realId, 'Cooking', res.data.handledBy), 2000);
      setTimeout(() => updateOrderStatus(realId, 'Ready', res.data.handledBy), 5000);

    } catch (err) {
      updateOrderStatus(orderId, 'Failed');
      showNotification('Order failed!', 'error');
    } finally {
      setCheckoutItem(null);
    }
  };

  const updateOrderStatus = (id, status, handledBy, realId) => {
    setOrders(prev => prev.map(o => (o.id === id || o.id === realId) ? { ...o, id: realId || id, status, handledBy } : o));
  };

  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Render Auth Pages
  if (!token) {
    if (page === 'signup') return <Signup onSignup={() => setPage('login')} onSwitchToLogin={() => setPage('login')} />;
    return <Login onLogin={handleLogin} onSwitchToSignup={() => setPage('signup')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">

      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setPage('menu')}>
              <div className="bg-gradient-to-tr from-orange-500 to-red-600 p-2.5 rounded-2xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition duration-300">
                <ChefHat size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition">
                Crave<span className="text-orange-500">Fast.</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
              {['menu', 'orders'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${page === p ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
                <User size={16} className="text-orange-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customer</span>
                <span className="font-bold text-sm leading-none">{user?.name || 'Foodie'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20">
        {page === 'menu' && (
          <div className="max-w-7xl mx-auto px-6">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 relative py-12 px-10 rounded-[40px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl"
            >
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 text-orange-400 font-black tracking-widest text-xs uppercase mb-4">
                  <Navigation size={14} /> Delivering to Mumbai
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-white">
                  Satisfy your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-red-600">
                    Cravings.
                  </span>
                </h1>
                <p className="text-lg text-slate-400 mb-8 max-w-lg">
                  Order from the best restaurants and get your favorite food delivered fast to your doorstep.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95">Browse Offers</button>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5">
                    <UtensilsCrossed className="text-orange-500" size={20} />
                    <span className="font-bold">50+ Restaurants</span>
                  </div>
                </div>
              </div>
              {/* Abstract Shape */}
              <div className="absolute right-[-10%] top-[-20%] w-[60%] h-[140%] bg-gradient-to-bl from-orange-500/20 to-transparent rotate-12 blur-3xl rounded-full" />
            </motion.div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {loading ? (
                [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-[400px] bg-white/5 rounded-[32px] animate-pulse border border-white/5" />
                ))
              ) : Object.entries(menu).map(([item, price], idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-slate-900/50 backdrop-blur-sm rounded-[32px] border border-white/5 p-5 transition-all duration-300 hover:bg-slate-900 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10"
                >
                  <div className="relative h-48 mb-6 overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent group-hover:from-orange-500/10 transition" />
                    <span className="text-7xl drop-shadow-2xl transform group-hover:scale-110 transition duration-500">
                      {item.includes('Pizza') ? '🍕' : item.includes('Burger') ? '🍔' : item.includes('Pasta') ? '🍝' : item.includes('Dosa') ? '🫓' : item.includes('Chole') ? '🍛' : item.includes('Jamun') ? '🍡' : item.includes('Lassi') ? '🥛' : '🥤'}
                    </span>
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                      Bestseller
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 group-hover:text-orange-400 transition">{item}</h3>
                  <p className="text-slate-500 mb-6 text-sm line-clamp-2">Premium ingredients & authentic taste, prepared fresh daily.</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-bold line-through ml-1 opacity-50">₹{price + 100}</span>
                      <span className="text-2xl font-black text-white">₹{price}</span>
                    </div>
                    <button
                      onClick={() => initiateOrder(item, price)}
                      className="bg-white text-slate-950 px-5 py-3 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-2 group/btn"
                    >
                      Order <ShoppingBag size={18} className="group-hover/btn:translate-x-1 transition" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Internal Live Orders */}
            {orders.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-16 border-t border-white/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black flex items-center gap-3">
                    <Clock className="text-orange-500" /> Active Tracking
                  </h2>
                  <button onClick={() => setPage('orders')} className="text-orange-400 font-bold hover:underline">View History</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:bg-white/10 transition group"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${order.status === 'Accepted' ? 'bg-green-500/10 text-green-400' :
                            order.status === 'Cooking' ? 'bg-orange-500/10 text-orange-400' :
                              order.status === 'Ready' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-slate-800 text-slate-500'
                            }`}>
                            {order.status === 'Ready' ? <CheckCircle size={28} /> :
                              order.status === 'Failed' ? <AlertCircle size={28} /> :
                                <Loader2 size={28} className={order.status !== 'Ready' && order.status !== 'Failed' ? 'animate-spin' : ''} />}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">Order #{order.id}</h4>
                            <p className="text-slate-500 text-sm font-medium">
                              {order.items.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${order.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            order.status === 'Cooking' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              order.status === 'Ready' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-slate-800 text-slate-400 border-white/5'
                            }`}>
                            {order.status}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {page === 'payment' && (
          <Payment
            item={checkoutItem.item}
            price={checkoutItem.price}
            onPay={finalizeOrder}
            onCancel={() => setPage('menu')}
          />
        )}

        {page === 'orders' && (
          <OrderHistory
            userId={user?.id}
            onBack={() => setPage('menu')}
          />
        )}
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border ${notification.type === 'error' ? 'bg-red-500 border-red-400 text-white' :
              'bg-slate-900 border-white/10 text-white'
              } backdrop-blur-xl z-[100]`}
          >
            <div className={`p-2 rounded-lg ${notification.type === 'error' ? 'bg-white/20' : 'bg-orange-500/20'}`}>
              {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} className="text-orange-400" />}
            </div>
            <span className="font-bold text-sm">{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
