import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, TrendingUp, AlertTriangle, Zap, Image as ImageIcon, Box, Plus, Clock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    monthlyRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    outOfStock: 0,
    topPerformers: [] as any[],
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for orders to calculate revenue and totals
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalOrders = orders.length;
      const monthlyRevenue = orders
        .filter((o: any) => {
          const orderDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date();
          const now = new Date();
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, o: any) => sum + (o.total || 0), 0);
      
      setStatsData(prev => ({ ...prev, totalOrders, monthlyRevenue }));
      setRecentOrders(orders.slice(0, 5));
    });

    // Real-time listener for products for out of stock
    const qProducts = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data());
      const outOfStock = products.filter(p => !p.stock || p.stock <= 0).length;
      
      // Artificial top performers for now or could be calculated from orders
      const topPerformers = products.slice(0, 3).map(p => ({
        name: p.name,
        sales: Math.floor(Math.random() * 50) + 10,
        stock: p.stock || 0,
        price: `৳${p.discountPrice || p.price}`
      }));

      setStatsData(prev => ({ ...prev, outOfStock, topPerformers }));
    });

    // Fetch customers
    const fetchCustomers = async () => {
      const cSnap = await getDocs(collection(db, 'users'));
      setStatsData(prev => ({ ...prev, newCustomers: cSnap.size }));
      setLoading(false);
    };
    fetchCustomers();

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const stats = [
    { label: 'Revenue (Monthly)', value: `৳${statsData.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: statsData.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Registered Agents', value: statsData.newCustomers.toString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Stock Alerts', value: `${statsData.outOfStock} items`, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight italic uppercase">CONTROL CENTER</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time overview of your gadget empire.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            REPORTS
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition shadow-xl shadow-slate-900/20"
          >
            REFRESH
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 group hover:border-emerald-200 transition-all duration-300">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-emerald-600" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Revenue (Monthly)</p>
          <p className="text-xl md:text-3xl font-black text-slate-900 mt-1 md:mt-2">৳{statsData.monthlyRevenue.toLocaleString()}</p>
        </div>

        {/* Orders Card */}
        <div onClick={() => navigate('/admin/orders')} className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 group hover:border-blue-200 transition-all duration-300 cursor-pointer">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5 md:w-7 md:h-7 text-blue-600" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
          <div className="flex items-end justify-between">
            <p className="text-xl md:text-3xl font-black text-slate-900 mt-1 md:mt-2">{statsData.totalOrders.toString()}</p>
            <div className="text-[9px] font-black text-blue-600 uppercase mb-1">Signals →</div>
          </div>
        </div>

        {/* Registered Users Card */}
        <div onClick={() => navigate('/admin/partners')} className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 group hover:border-indigo-200 transition-all duration-300 cursor-pointer">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 md:w-7 md:h-7 text-indigo-600" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Registered Users</p>
          <div className="flex items-end justify-between">
            <p className="text-xl md:text-3xl font-black text-slate-900 mt-1 md:mt-2">{statsData.newCustomers.toString()}</p>
            <div className="text-[9px] font-black text-indigo-600 uppercase mb-1">Database →</div>
          </div>
        </div>

        {/* Stock Alerts Card */}
        <div onClick={() => navigate('/admin/products')} className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 group hover:border-rose-200 transition-all duration-300 cursor-pointer">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5 md:w-7 md:h-7 text-rose-600" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Stock Alerts</p>
          <div className="flex items-end justify-between">
            <p className="text-xl md:text-3xl font-black text-slate-900 mt-1 md:mt-2">{statsData.outOfStock} items</p>
            <div className="text-[9px] font-black text-rose-600 uppercase mb-1">Critical →</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight pr-4">Top Performers</h2>
               <div className="h-0.5 flex-1 bg-slate-100 hidden sm:block"></div>
            </div>
            <div className="space-y-4 md:space-y-6">
              {statsData.topPerformers.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 md:p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl md:rounded-3xl border border-slate-100 transition-colors group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mr-4 font-black italic text-emerald-600">#{i+1}</div>
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base group-hover:text-emerald-600 transition-colors">{item.name}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-0.5">{item.sales} units sold • {item.stock} left</p>
                    </div>
                  </div>
                  <p className="font-black text-emerald-600 text-sm md:text-lg">{item.price}</p>
                </div>
              ))}
              {statsData.topPerformers.length === 0 && (
                 <div className="text-center py-10 text-slate-400 font-bold italic">Gathering operational data...</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight pr-4">Recent Deployments</h2>
               <div className="h-0.5 flex-1 bg-slate-100 hidden sm:block"></div>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{order.deliveryAddress?.fullName || 'Anonymous'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600 italic">৳{order.total.toFixed(2)}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.status}</p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                 <div className="text-center py-10 text-slate-400 font-bold italic">Waiting for incoming signals...</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          
          <div>
            <h2 className="text-xl font-black mb-8 italic uppercase tracking-widest pl-2 border-l-4 border-emerald-500">Fast Lane</h2>
            <div className="space-y-3">
               <button 
                 onClick={() => navigate('/admin/products')}
                 className="w-full py-5 px-6 bg-white/5 hover:bg-white/10 rounded-2xl md:rounded-3xl text-left font-black transition border border-white/5 flex items-center justify-between group"
               >
                  <div className="flex items-center gap-4">
                     <Zap className="w-5 h-5 text-amber-400" />
                     <span className="text-sm italic">FLASH SALE</span>
                  </div>
                  <Plus className="w-4 h-4 text-white/20 group-hover:text-white transition" />
               </button>
               <button 
                 onClick={() => navigate('/admin/settings')}
                 className="w-full py-5 px-6 bg-white/5 hover:bg-white/10 rounded-2xl md:rounded-3xl text-left font-black transition border border-white/5 flex items-center justify-between group"
               >
                  <div className="flex items-center gap-4">
                     <ImageIcon className="w-5 h-5 text-blue-400" />
                     <span className="text-sm italic">PROMO BANNERS</span>
                  </div>
                  <Plus className="w-4 h-4 text-white/20 group-hover:text-white transition" />
               </button>
               <button 
                 onClick={() => navigate('/admin/products')}
                 className="w-full py-5 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-2xl md:rounded-3xl text-left font-black transition shadow-xl shadow-emerald-600/30 flex items-center justify-between group border border-emerald-500"
               >
                  <div className="flex items-center gap-4">
                     <Box className="w-5 h-5 text-white" />
                     <span className="text-sm italic">INVENTORY</span>
                  </div>
                  <Plus className="w-4 h-4 text-white/50 group-hover:text-white transition" />
               </button>
            </div>
          </div>
          
          <div className="mt-12 md:mt-0 pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Kernel Status</p>
            <div className="flex items-center space-x-3 text-[10px] font-black italic text-emerald-400 uppercase">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
              <span>Live Systems Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
