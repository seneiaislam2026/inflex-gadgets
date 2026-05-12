import React, { useState } from 'react';
import { Search, MapPin, Package, CheckCircle, Truck, Settings, LogIn, ClipboardCheck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';

export default function TrackOrder() {
  const { user } = useAuthStore();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ _id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Order not found. Please check your Order ID.');
      }
    } catch (err) {
      setError('An error occurred while tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 italic uppercase">Track Your Gadgets</h1>
        <p className="text-slate-500 mb-6">Enter your order ID below to see its journey to you.</p>
        
        {!user && (
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition text-sm"
          >
            <LogIn className="w-4 h-4" />
            Login for order history
          </Link>
        )}
      </div>

      <form onSubmit={handleTrack} className="max-w-xl mx-auto mb-12">
        <div className="relative group">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. jf82Kls...)"
            required
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm group-hover:shadow-md"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition disabled:opacity-50 text-xs sm:text-sm"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
        {error && <p className="mt-3 text-rose-500 text-sm font-medium text-center">{error}</p>}
      </form>

      {order && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
              <h2 className="text-lg font-mono font-bold text-slate-900">{order._id}</h2>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Status</p>
              <p className="text-xl font-black text-emerald-700 capitalize">{order.status}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-12 mt-4">
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-100 rounded-full z-0">
               <div 
                 className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                 style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
               ></div>
            </div>
            
            <div className="relative z-10 flex justify-between">
              {steps.map((step, idx) => (
                 <div key={idx} className="flex flex-col items-center flex-1 min-w-0 px-0.5">
                   <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center transition-colors duration-500 mb-2 sm:mb-3 flex-shrink-0
                     ${idx <= currentStep ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}
                   `}>
                     {idx === 0 && <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                     {idx === 1 && <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                     {idx === 2 && <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-slow" />}
                     {idx === 3 && <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                     {idx === 4 && <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                   </div>
                   <p className={`text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest text-center truncate w-full ${idx <= currentStep ? 'text-emerald-600' : 'text-slate-400'}`}>
                     {step}
                   </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
               <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest italic">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Delivery Information
               </h3>
               <div className="space-y-4">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recipient</p>
                    <p className="text-sm font-bold text-slate-900 uppercase">{order.deliveryAddress?.fullName || 'N/A'}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                    <p className="text-sm font-bold text-slate-900">{order.deliveryAddress?.street || 'N/A'}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">District</p>
                    <p className="text-sm font-bold text-slate-900">{order.deliveryAddress?.district || 'N/A'}</p>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl z-0"></div>
               <div className="relative z-10">
                 <h3 className="text-xs font-black text-emerald-800 mb-6 flex items-center gap-2 uppercase tracking-widest italic">
                    <Package className="w-4 h-4 text-emerald-500" />
                    Product Details
                 </h3>
                 <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                   {order.items.map((item: any, i: number) => (
                     <div key={i} className="flex items-center gap-4 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 shadow-sm">
                       <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-100 p-1 flex-shrink-0">
                         {item.photo ? (
                           <img src={item.photo} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-emerald-200">
                             <Package className="w-6 h-6" />
                           </div>
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-sm font-black text-slate-900 truncate uppercase">{item.name}</div>
                         <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Qty: {item.quantity} × ৳{item.price}</div>
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="mt-6 pt-4 border-t border-emerald-100 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</span>
                   <span className="text-xl font-black text-emerald-700 tracking-tighter">৳{order.total.toLocaleString()}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
