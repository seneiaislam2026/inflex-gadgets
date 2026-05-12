import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { db } from '../lib/firebase.ts';
import { Package, Truck, CheckCircle, Clock, Calendar, ShieldCheck, ArrowRight, Globe } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [importRequests, setImportRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'imports' | 'collection'>('orders');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Orders subscription
    const qOrders = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });

    // Import Requests subscription
    const qImports = query(
      collection(db, 'importRequests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubImports = onSnapshot(qImports, (snapshot) => {
      setImportRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubOrders();
      unsubImports();
    };
  }, [user]);

  // Extract unique products from delivered/shipped orders
  const userCollection = orders
    .filter(o => o.status === 'delivered' || o.status === 'shipped')
    .flatMap(o => o.items.map((item: any) => ({
      ...item,
      orderId: o._id,
      purchaseDate: o.createdAt
    })));

  if (!user) {
    return <div className="text-center py-20 text-slate-500">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">User Profile</h1>
          <p className="text-slate-500 mt-2">Manage your account and order history</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xl">
             {user.name?.[0] || 'U'}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{user.email}</p>
            <div className={`mt-2 inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${user.isAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
               {user.isAdmin ? 'Admin' : 'Verified Customer'}
            </div>
            {user.isAdmin && (
              <Link 
                to="/admin" 
                className="mt-3 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em] hover:bg-indigo-50 p-2 rounded-xl border border-indigo-100 transition-colors"
                title="Access Admin Console"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
                <ArrowRight className="w-3 h-3 ml-auto text-indigo-300" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8 w-fit overflow-x-auto max-w-full items-center">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          My Orders
        </button>
        <button 
          onClick={() => setActiveTab('imports')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'imports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Special Requests
        </button>
        <button 
          onClick={() => setActiveTab('collection')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'collection' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          My Gadgets
        </button>
        <Link 
          to="/shop"
          className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ml-auto shadow-sm"
        >
          Explore All Products
        </Link>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.map(order => {
             const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
             const estDate = order.customDeliveryDate 
               ? new Date(order.customDeliveryDate) 
               : (() => {
                   const d = new Date(orderDate);
                   d.setDate(d.getDate() + (order.deliveryAddress?.district === 'Dhaka' ? 3 : 5));
                   return d;
                 })();

             return (
              <div key={order._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative group">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-lg font-black text-slate-900 tracking-tighter">#{order._id.toUpperCase()}</span>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                         ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                           order.status === 'processing' ? 'bg-sky-100 text-sky-600' :
                           order.status === 'shipped' ? 'bg-indigo-100 text-indigo-600' :
                           order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                           'bg-rose-100 text-rose-600'
                         }`}>
                         {order.status}
                       </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> Ordered: {orderDate.toLocaleDateString()}
                    </p>
                  </div>

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-indigo-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Delivery</p>
                          <p className="text-sm font-black text-slate-900 uppercase italic">{estDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                       </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                         {item.image ? (
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                         ) : (
                           <Package className="w-8 h-8 text-slate-200" />
                         )}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 text-sm italic uppercase">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Unit Cost: ৳{item.price}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-slate-900 tracking-tight">x{item.quantity}</p>
                         <p className="text-sm font-black text-emerald-600 mt-1">৳{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                    <p className="text-xs font-black text-slate-900 uppercase">Cash on Delivery</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter italic">৳{order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
             );
          })}
          {orders.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <div className="text-slate-500 font-black uppercase text-sm italic">No orders found yet</div>
              <p className="text-xs text-slate-400 mt-2">Start shopping for your favorite gadgets now</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'imports' && (
        <div className="grid grid-cols-1 gap-6">
          {importRequests.map((req) => (
             <div key={req.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 p-2 overflow-hidden flex-shrink-0 border border-slate-100">
                       {req.productPhoto ? (
                         <img src={req.productPhoto} alt={req.productName} className="w-full h-full object-cover rounded-2xl" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-200">
                            <Package className="w-10 h-10" />
                         </div>
                       )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{req.productName}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                            req.status === 'shipped' ? 'bg-indigo-100 text-indigo-600' :
                            req.status === 'delivered' ? 'bg-emerald-500 text-white' :
                            'bg-rose-100 text-rose-600'
                          }`}>
                          {req.status}
                        </span>
                        {req.quotedPrice && (
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                             Quote: ৳{req.quotedPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-medium line-clamp-2 italic">"{req.description}"</p>
                    </div>
                  </div>
                  
                  {req.status !== 'delivered' && req.probableDeliveryDate && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 h-fit">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                       <p className="text-sm font-black text-slate-900 uppercase italic">
                         {new Date(req.probableDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </p>
                    </div>
                  )}
                </div>
                
                {req.quotedPrice && req.status === 'approved' && (
                  <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                      আমাদের সোর্সিং টিম এই প্রোডাক্টটি খুজে পেয়েছে। আপনি কি এটি কনফার্ম করতে চান? চূড়ান্ত দাম: <span className="text-emerald-900 font-black">৳{req.quotedPrice}</span>
                    </p>
                    <button 
                      onClick={() => navigate('/support')}
                      className="mt-3 w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-colors"
                    >
                      Confirm Order with Support
                    </button>
                  </div>
                )}
             </div>
          ))}
          {importRequests.length === 0 && (
             <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <div className="text-slate-500 font-black uppercase text-sm italic">No special requests found</div>
                <p className="text-xs text-slate-400 mt-2">Request an item from USA/UK/China to see it here</p>
             </div>
          )}
        </div>
      )}

      {activeTab === 'collection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {userCollection.map((gadget, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-6 group">
                 <div className="w-24 h-24 rounded-3xl bg-slate-50 p-2 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                    {gadget.image ? (
                      <img src={gadget.image} alt={gadget.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Package className="w-12 h-12 text-slate-200" />
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                       <CheckCircle className="w-3 h-3 text-emerald-500" />
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Purchased</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 truncate uppercase italic">{gadget.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Purchased via #{gadget.orderId.toUpperCase()}</p>
                    <div className="mt-4 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Item Active</span>
                    </div>
                 </div>
              </div>
           ))}
           {userCollection.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <div className="text-slate-500 font-black uppercase text-sm italic">Your gadget collection is empty</div>
                <p className="text-xs text-slate-400 mt-2">Complete an order to see it here</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
