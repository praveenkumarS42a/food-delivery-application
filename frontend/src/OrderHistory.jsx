import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Package, MapPin, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

export default function OrderHistory({ userId, onBack }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_GATEWAY}/orders/user/${userId}`);
            setOrders(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Ready': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Cooking': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default: return 'bg-slate-700 text-slate-300 border-white/5';
        }
    };

    const getRandomTime = (timestamp) => {
        if (timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        }
        const times = ['20 mins ago', '1 hour ago', 'Yesterday', '3 days ago', 'Last week'];
        return times[Math.floor(Math.random() * times.length)];
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition"
                    >
                        <ChevronLeft size={20} /> Back to Dashboard
                    </button>
                    <h2 className="text-4xl font-black">My Orders</h2>
                </div>
                <button
                    onClick={fetchOrders}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10"
                >
                    <Clock size={20} className="text-orange-400" />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 size={40} className="animate-spin text-orange-500" />
                    <p className="text-slate-400 animate-pulse">Fetching your delicious history...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                    <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
                    <p className="text-red-400 mb-6">{error}</p>
                    <button onClick={fetchOrders} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">Try Again</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <Package size={60} className="mx-auto text-slate-700 mb-6" />
                    <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
                    <p className="text-slate-400 mb-8">Hungry? Place your first order today!</p>
                    <button onClick={onBack} className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black">Browse Menu</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order, idx) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group bg-white/5 border border-white/10 rounded-3xl p-6 transition-all duration-300 ${expandedOrder === order._id ? 'bg-white/10 ring-1 ring-orange-500/20' : 'hover:bg-white/10'
                                }`}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                                        <Package className="text-orange-500" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold">Order #{order._id.slice(-6).toUpperCase()}</h4>
                                        <p className="text-sm text-slate-500">{getRandomTime(order.timestamp)}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {order.items.map((item, i) => (
                                    <span key={i} className="bg-white/5 px-3 py-1 rounded-lg text-sm border border-white/10 text-slate-300">
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <AnimatePresence>
                                {expandedOrder === order._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                            <div className="space-y-4">
                                                <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Bill Details</h5>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>Item Total</span>
                                                        <span>₹{order.subtotal || (order.total - (order.gst || 0) - (order.service_fee || 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>GST</span>
                                                        <span>₹{order.gst || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>Service Fee</span>
                                                        <span>₹{order.service_fee || (order.total ? 25 : 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-white font-bold pt-2 border-t border-white/5">
                                                        <span>Total Paid</span>
                                                        <span className="text-orange-400">₹{order.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Payment & Delivery</h5>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>Method</span>
                                                        <span className="uppercase text-white font-medium">{order.payment_method || 'UPI'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>Delivered to</span>
                                                        <span className="text-white font-medium">Home • Mumbai</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>Service ID</span>
                                                        <span className="text-slate-500 font-mono">{order.handledBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <MapPin size={14} /> Mumbai, India
                                </div>
                                <button
                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                    className="text-orange-400 font-bold text-sm hover:underline"
                                >
                                    {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
