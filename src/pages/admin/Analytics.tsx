import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { Search, TrendingUp, AlertTriangle, CheckCircle, XCircle, Package, Truck, MinusCircle, UserX, UserCheck } from 'lucide-react';

// We want to calculate 
// Total number of orders
// Number of successful deliveries (status = delivered)
// Number of failed/cancelled/returned deliveries 
// Success rate (%)

export default function Analytics() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [couriers, setCouriers] = useState<any>(null);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      setLoading(true);
      try {
        const userInfo = localStorage.getItem('userInfo');
        let token = 'dev-secret-token';
        if (userInfo) {
          token = JSON.parse(userInfo).token || 'dev-secret-token';
        }
        const response = await fetch(`/api/analytics/global-delivery`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
          setCouriers(data.couriers);
        }
      } catch (err) {
        console.error('Error fetching global analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalStats();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setSearched(true);
    try {
      const userInfo = localStorage.getItem('userInfo');
      let token = 'dev-secret-token';
      if (userInfo) {
        token = JSON.parse(userInfo).token || 'dev-secret-token';
      }
      
      const response = await fetch(`/api/analytics/customer-delivery/${phoneNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setSummary(data.summary);
      setCouriers(data.couriers);
      setOrders(data.orders);
    } catch (error) {
       console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = summary?.total_orders || 0;
  const deliveredOrders = summary?.delivered || 0;
  const failedOrders = summary?.failed || 0;
  const inProgressOrders = summary?.pending || 0;
  
  const trustScore = summary?.success_rate || 0;
  
  // High Trust: 80-100, Medium: 50-79, Risky: <50
  
  let trustLevel = 'Unknown';
  let trustColor = 'text-slate-400';
  let trustBg = 'bg-slate-100';
  let trustIcon = <MinusCircle className="w-8 h-8 text-slate-400" />;

  if (totalOrders > 0) {
    if (trustScore >= 80) {
      trustLevel = 'High Trust';
      trustColor = 'text-emerald-600';
      trustBg = 'bg-emerald-100';
      trustIcon = <UserCheck className="w-8 h-8 text-emerald-600" />;
    } else if (trustScore >= 50) {
      trustLevel = 'Medium Trust';
      trustColor = 'text-amber-600';
      trustBg = 'bg-amber-100';
      trustIcon = <AlertTriangle className="w-8 h-8 text-amber-600" />;
    } else {
      trustLevel = 'Risky';
      trustColor = 'text-rose-600';
      trustBg = 'bg-rose-100';
      trustIcon = <UserX className="w-8 h-8 text-rose-600" />;
    }
  }

  // Generate fake chart data just to mimic the view using div widths
  // We can just use the counts
  
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            CUSTOMER INSIGHTS
          </h1>
          <p className="text-slate-500 font-medium mt-1">Delivery tracking and trust analytics</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter customer phone number..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !phoneNumber}
            className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Analyze'}
          </button>
        </form>
      </div>

      {summary && !loading && totalOrders === 0 && (
         <div className="bg-white p-12 text-center rounded-[2rem] shadow-xl shadow-slate-200/50">
           <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
           <h3 className="text-xl font-black text-slate-900">No History Found</h3>
           <p className="text-slate-500 mt-2">{searched ? 'There are no orders associated with this phone number.' : 'Your platform has no recorded deliveries.'}</p>
         </div>
      )}

      {summary && !loading && totalOrders > 0 && (
         <div className="space-y-6">
            
            {/* Risk Control Alert */}
            {searched && totalOrders > 0 && trustScore < 50 && (
               <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-6 rounded-[2rem] shadow-xl shadow-rose-500/20 flex items-start gap-4 animate-in slide-in-from-top-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                     <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">HIGH RISK CUSTOMER DETECTED</h3>
                    <p className="opacity-90 font-medium text-sm mt-1">This number has a high delivery failure rate. Consider disabling COD and requiring partial or full advance payment for future orders.</p>
                  </div>
               </div>
            )}

            {!searched && (
              <div className="bg-emerald-50 text-emerald-800 p-6 rounded-[2rem] flex items-center justify-between shadow-sm border border-emerald-100">
                 <div>
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Platform Delivery Analytics</h3>
                    <p className="font-medium text-emerald-700/80 text-sm mt-1">Showing aggregate metrics across your entire store. Search a customer phone number for specific filtering.</p>
                 </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col items-center text-center justify-center border border-slate-100">
                  <div className={`p-4 rounded-full mb-4 ${trustBg}`}>
                     {trustIcon}
                  </div>
                  <h3 className={`text-3xl font-black ${trustColor}`}>{totalOrders > 0 ? `${trustScore}%` : 'N/A'}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{searched ? 'Trust Score' : 'Overall Success Rate'}</p>
                  {searched && (
                    <div className={`mt-2 text-xs font-black px-3 py-1 rounded-full ${trustBg} ${trustColor}`}>
                      {trustLevel}
                    </div>
                  )}
               </div>

               <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col justify-center border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500 mb-4">
                     <Package className="w-5 h-5" />
                     <span className="text-sm font-bold uppercase tracking-widest">Total Orders</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{totalOrders}</div>
                  <div className="mt-2 text-sm text-slate-500 font-medium">Lifetime purchases</div>
               </div>

               <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col justify-center border border-emerald-100">
                  <div className="flex items-center gap-3 text-emerald-500 mb-4">
                     <CheckCircle className="w-5 h-5" />
                     <span className="text-sm font-bold uppercase tracking-widest">Delivered</span>
                  </div>
                  <div className="text-4xl font-black text-emerald-600">{deliveredOrders}</div>
                  <div className="mt-2 text-sm text-emerald-600/80 font-medium">Successful deliveries</div>
               </div>

               <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col justify-center border border-rose-100">
                  <div className="flex items-center gap-3 text-rose-500 mb-4">
                     <XCircle className="w-5 h-5" />
                     <span className="text-sm font-bold uppercase tracking-widest">Failed</span>
                  </div>
                  <div className="text-4xl font-black text-rose-600">{failedOrders}</div>
                  <div className="mt-2 text-sm text-rose-600/80 font-medium">Cancelled or returned</div>
               </div>
            </div>

            {/* Courier Breakdown */}
            {couriers && (
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-6">Courier Intelligence</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(couriers).map(([name, stats]: [string, any]) => (
                    <div key={name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-4">{name}</h4>
                      <div className="flex justify-between items-center text-sm font-medium text-slate-500 mb-2">
                         <span>Total Handled</span>
                         <span className="font-bold text-slate-900">{stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-emerald-600 mb-2">
                         <span>Delivered</span>
                         <span className="font-bold">{stats.delivered}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-rose-600">
                         <span>Failed</span>
                         <span className="font-bold">{stats.failed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Timeline or Table */}
            {searched && orders && orders.length > 0 && (
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                 <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Delivery History</h2>
                    {inProgressOrders > 0 && (
                       <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-bold">
                          <Truck className="w-4 h-4" />
                          {inProgressOrders} in progress
                       </div>
                    )}
                 </div>
                 
                 <div className="overflow-x-auto">
                   <table className="w-full">
                   <thead className="bg-slate-50 border-b border-slate-100">
                     <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                       <th className="p-4 pl-6">Order ID</th>
                       <th className="p-4">Date</th>
                       <th className="p-4">Items</th>
                       <th className="p-4">Amount</th>
                       <th className="p-4">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {orders.map((order) => {
                        const status = order.deliveryStatus || order.status;
                        let statusColor = 'bg-slate-100 text-slate-500';
                        if (status === 'delivered') statusColor = 'bg-emerald-100 text-emerald-600';
                        else if (['failed', 'cancelled', 'returned'].includes(status)) statusColor = 'bg-rose-100 text-rose-600';
                        else if (['pending', 'processing', 'shipped', 'confirmed'].includes(status)) statusColor = 'bg-sky-100 text-sky-600';

                        return (
                          <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6 text-sm font-black text-slate-900 uppercase">
                              #{order._id.substring(0,6)}
                            </td>
                            <td className="p-4 text-sm text-slate-500 font-medium">
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown')}
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {order.items?.length || 0}
                              </div>
                            </td>
                            <td className="p-4 text-sm font-bold text-emerald-600">
                              ৳{order.totalAmount || order.total || 0}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                                {order.deliveryStatus || order.status}
                              </span>
                            </td>
                          </tr>
                        );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
         </div>
      )}
    </div>
  );
}
