import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building2, Banknote, ChevronLeft, ShieldCheck, MapPin } from 'lucide-react';

export default function Payment({ item, price, onPay, onCancel }) {
    const [method, setMethod] = useState('upi');
    const [paying, setPaying] = useState(false);

    const gst = Math.round(price * 0.05);
    const serviceFee = 25;
    const total = price + gst + serviceFee;

    const handlePayment = () => {
        setPaying(true);

        // Simulate payment processing based on method
        let delay = 2000;
        if (method === 'card') delay = 3500; // Cards take longer to authenticate
        if (method === 'upi') delay = 2500; // UPI deep linking simulation
        if (method === 'cod') delay = 1000; // COD is instant confirmation

        setTimeout(() => {
            onPay({
                method,
                subtotal: price,
                total,
                gst,
                serviceFee,
                transactionId: method !== 'cod' ? `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}` : 'CASH'
            });
            setPaying(false);
        }, delay);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <button
                onClick={onCancel}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
            >
                <ChevronLeft size={20} /> Back to Menu
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left: Payment Methods */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Checkout</h2>
                        <p className="text-slate-400">Choose your preferred payment method</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'upi', name: 'UPI (GPay, PhonePe, Paytm)', icon: <Smartphone className="text-blue-400" /> },
                            { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="text-purple-400" /> },
                            { id: 'net', name: 'Net Banking', icon: <Building2 className="text-orange-400" /> },
                            { id: 'cod', name: 'Cash on Delivery', icon: <Banknote className="text-green-400" /> },
                        ].map((m) => (
                            <label
                                key={m.id}
                                className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${method === m.id ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${method === m.id ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                                        {m.icon}
                                    </div>
                                    <span className={`font-semibold ${method === m.id ? 'text-white' : 'text-slate-300'}`}>{m.name}</span>
                                </div>
                                <input
                                    type="radio"
                                    name="payment"
                                    className="hidden"
                                    checked={method === m.id}
                                    onChange={() => setMethod(m.id)}
                                />
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-orange-500' : 'border-slate-600'}`}>
                                    {method === m.id && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4">
                        <div className="bg-green-500/20 p-3 rounded-full h-fit">
                            <ShieldCheck className="text-green-400" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Secure Checkout</h4>
                            <p className="text-sm text-slate-400">Your connection is encrypted and payment details are never stored.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">
                                        {item.includes('Pizza') ? '🍕' : item.includes('Burger') ? '🍔' : item.includes('Pasta') ? '🍝' : item.includes('Dosa') ? '🫓' : item.includes('Chole') ? '🍛' : '🥤'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{item}</h4>
                                        <p className="text-xs text-slate-400">x 1</p>
                                    </div>
                                </div>
                                <span className="font-bold">₹{price}</span>
                            </div>

                            <div className="space-y-2 text-slate-400 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST (5%)</span>
                                    <span>₹{gst}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Fee</span>
                                    <span>₹{serviceFee}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-slate-300">Total Amount</span>
                            <span className="text-3xl font-black text-orange-400">₹{total}</span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={paying}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
                        >
                            {paying ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>Proceed to Pay ₹{total}</>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4">By clicking place order you agree to our terms and conditions.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h4 className="flex items-center gap-2 font-bold mb-3">
                            <MapPin size={18} className="text-orange-400" /> Delivery Address
                        </h4>
                        <p className="text-sm text-slate-300">Home • House No. 42, Green Valley Apartments, Mumbai, India</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
