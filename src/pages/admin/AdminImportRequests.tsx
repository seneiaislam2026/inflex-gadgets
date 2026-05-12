import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase.ts';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Globe, Clock, CheckCircle, XCircle, Package, ExternalLink, Calendar, Search, Filter, ArrowRight, ShieldAlert, Mail } from 'lucide-react';

interface ImportRequest {
  id: string;
  userId: string;
  productName: string;
  productPhoto?: string;
  description?: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'rejected';
  probableDeliveryDate?: string;
  quotedPrice?: number;
  createdAt: any;
}

export default function AdminImportRequests() {
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'importRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImportRequest));
      setRequests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, date?: string, price?: number) => {
    try {
      const data: any = { status, updatedAt: new Date() };
      if (date !== undefined) data.probableDeliveryDate = date;
      if (price !== undefined) data.quotedPrice = price;
      await updateDoc(doc(db, 'importRequests', id), data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.productName.toLowerCase().includes(searchTerm.toLowerCase()) || req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-emerald-400" />
               </div>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Logistics Terminal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 italic">Import Operations</h1>
            <p className="text-slate-400 font-medium max-w-lg">Manage cross-border sourcing requests and dispatch protocols from the global network.</p>
         </div>
         <Globe className="absolute -right-20 -top-20 w-80 h-80 text-white/5 pointer-events-none" />
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
               type="text" 
               placeholder="Search by product name or request ID..."
               className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 ml-2 hidden md:block" />
            <select 
               className="flex-1 md:w-40 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-slate-900"
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value)}
            >
               <option value="all">All Status</option>
               <option value="pending">Pending</option>
               <option value="approved">Approved</option>
               <option value="shipped">Shipped</option>
               <option value="delivered">Delivered</option>
               <option value="rejected">Rejected</option>
            </select>
         </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex flex-col lg:flex-row">
               {/* Visual Profile */}
               <div className="w-full lg:w-48 bg-slate-50 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div className="w-32 h-32 bg-white rounded-3xl shadow-sm overflow-hidden p-2 group-hover:scale-105 transition-transform">
                     {request.productPhoto ? (
                        <img src={request.productPhoto} alt={request.productName} className="w-full h-full object-contain" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                           <Package className="w-12 h-12" />
                        </div>
                     )}
                  </div>
                  <div className="mt-4 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID TAG</p>
                     <p className="text-xs font-black text-slate-900 italic">#{request.id.slice(-8).toUpperCase()}</p>
                  </div>
               </div>

               {/* Core Data */}
               <div className="flex-1 p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{request.productName}</h3>
                     <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm flex items-center gap-2 ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        request.status === 'approved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                        request.status === 'shipped' ? 'bg-slate-900 text-white shadow-slate-900/20' :
                        'bg-rose-100 text-rose-700'
                     }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                           request.status === 'pending' ? 'bg-amber-500' :
                           request.status === 'approved' ? 'bg-white' :
                           request.status === 'shipped' ? 'bg-emerald-400' :
                           'bg-rose-500'
                        }`}></div>
                        {request.status}
                     </div>
                     {request.quotedPrice && (
                       <div className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100">
                          ৳{request.quotedPrice}
                       </div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Sourcing Brief</p>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                           "{request.description || 'No additional specifications provided.'}"
                        </p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <Calendar className="w-4 h-4 text-slate-400" />
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Transmission Date</p>
                              <p className="text-xs font-bold text-slate-700">{request.createdAt?.toDate ? request.createdAt.toDate().toLocaleString() : 'Recent'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Globe className="w-4 h-4 text-emerald-500" />
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Origin Verification</p>
                              <p className="text-xs font-bold text-slate-700">Multi-Channel Global Sourcing</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Command Actions */}
               <div className="w-full lg:w-72 bg-slate-50 p-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 space-y-4">
                  {request.status === 'pending' ? (
                     <div className="space-y-3">
                        <button 
                           onClick={() => handleUpdateStatus(request.id, 'approved')}
                           className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 uppercase italic text-xs tracking-widest"
                        >
                           <CheckCircle className="w-4 h-4" /> Authorize
                        </button>
                        <button 
                           onClick={() => handleUpdateStatus(request.id, 'rejected')}
                           className="w-full bg-white text-rose-600 border border-rose-100 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-50 transition-all uppercase italic text-xs tracking-widest"
                        >
                           <ShieldAlert className="w-4 h-4" /> Terminate
                        </button>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quoted Price (৳)</label>
                           <input 
                              type="number" 
                              placeholder="Enter final cost..."
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition mt-2"
                              defaultValue={request.quotedPrice}
                              onBlur={(e) => handleUpdateStatus(request.id, request.status, undefined, parseFloat(e.target.value))}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E.T.A Dispatch</label>
                           <div className="relative mt-2">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                 type="date" 
                                 className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition"
                                 defaultValue={request.probableDeliveryDate}
                                 onBlur={(e) => handleUpdateStatus(request.id, request.status, e.target.value)}
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Status</label>
                           <div className="grid grid-cols-2 gap-2 mt-2">
                             {['approved', 'shipped', 'delivered', 'rejected'].map((s) => (
                               <button
                                 key={s}
                                 onClick={() => handleUpdateStatus(request.id, s)}
                                 className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                                   request.status === s 
                                     ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' 
                                     : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                                 }`}
                               >
                                 {s === 'shipped' ? 'In Transit' : s}
                               </button>
                             ))}
                           </div>
                        </div>
                        <div className="flex items-center justify-center pt-2 gap-3">
                           <ArrowRight className="w-4 h-4 text-slate-200 animate-pulse" />
                           <button 
                             onClick={() => alert('Customer notified via email regarding protocol update.')}
                             className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-colors shadow-sm"
                             title="Notify Customer"
                           >
                             <Mail className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-black italic uppercase tracking-widest">
            No Operational Requests Captured
          </div>
        )}
      </div>
    </div>
  );
}
