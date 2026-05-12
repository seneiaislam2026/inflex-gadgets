import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { Users, Mail, TrendingUp, UserPlus, Search, Filter, Shield, Edit, X } from 'lucide-react';

export default function AdminPartners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    investmentAmount: 0,
    profitSharePercentage: 0,
    status: 'active'
  });

  useEffect(() => {
    const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        _id: doc.id, 
        ...doc.data()
      }));
      setPartners(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPartner = async () => {
    if (!newPartner.name || !newPartner.email) return;
    try {
      await addDoc(collection(db, 'partners'), {
        ...newPartner,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setNewPartner({ name: '', email: '', investmentAmount: 0, profitSharePercentage: 0, status: 'active' });
    } catch (err) {
      console.error(err);
    }
  };

  const totalInvestment = partners.reduce((sum, p) => sum + (Number(p.investmentAmount) || 0), 0);

  const filteredPartners = partners.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">User Registry</h1>
          <p className="text-slate-500 font-medium">Manage registered agents, investors, and platform users.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-600 transition shadow-xl shadow-slate-900/10 uppercase tracking-widest text-xs italic">
          Register New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 backdrop-blur-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Network Capital</p>
            <p className="text-3xl font-black text-slate-900">৳{totalInvestment.toLocaleString()}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <div className="w-24 h-24 bg-slate-900 rounded-full"></div>
          </div>
        </div>
        <div className="bg-emerald-600 rounded-[2rem] p-8 shadow-xl shadow-emerald-600/10 backdrop-blur-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.2em] mb-1">Total Profit Matrix</p>
            <p className="text-3xl font-black text-white">{partners.reduce((sum, p) => sum + p.profitSharePercentage, 0)}%</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="w-24 h-24 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
               type="text" 
               placeholder="Search by name or email..."
               className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 outline-none transition shadow-sm"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity / Auth</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Share</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.map((partner) => (
                <tr key={partner._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                        {partner.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{partner.name || 'Anonymous User'}</div>
                        <div className="text-[10px] font-bold text-slate-400">{partner.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-900 font-black">
                    ৳{partner.investmentAmount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-emerald-600 font-black">
                    {partner.profitSharePercentage}%
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="px-3 py-1 inline-flex text-[9px] font-black rounded-lg bg-emerald-100 text-emerald-700 uppercase tracking-widest w-fit">
                        {partner.status}
                      </span>
                      {partner.role === 'admin' && (
                        <span className="px-2 py-0.5 inline-flex text-[7px] font-black rounded-md bg-slate-900 text-white uppercase tracking-widest w-fit">
                           Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 p-4 space-y-4">
          {loading ? (
             <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest italic">Authenticating Database...</div>
          ) : filteredPartners.map((partner) => (
            <div key={partner._id} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden group">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-900/10">
                      {partner.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{partner.name || 'Anonymous'}</h3>
                      <p className="text-[10px] font-bold text-slate-400">{partner.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 text-[8px] font-black rounded-lg bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                      {partner.status}
                    </span>
                    {partner.role === 'admin' && (
                      <span className="px-2 py-0.5 text-[7px] font-black rounded-md bg-slate-900 text-white uppercase tracking-[0.2em]">
                        ADMIN
                      </span>
                    )}
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital</p>
                     <p className="text-sm font-black text-slate-900">৳{partner.investmentAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Share</p>
                     <p className="text-sm font-black text-emerald-600">{partner.profitSharePercentage}%</p>
                  </div>
               </div>

               <div className="mt-6 flex items-center justify-end gap-3">
                  <button className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest italic text-slate-400 hover:text-slate-900 transition-colors">
                    Modify Records
                  </button>
               </div>
            </div>
          ))}
          {filteredPartners.length === 0 && !loading && (
             <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest italic">No match found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 border border-slate-200 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition bg-slate-50 rounded-xl">
               <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black mb-2 text-slate-900 tracking-tight italic uppercase">Enroll Partner</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Initialize new venture protocol</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Entity Name</label>
                <input 
                  type="text" 
                  className="block w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 focus:ring-4 focus:ring-slate-900/5 outline-none text-slate-900 font-bold transition shadow-sm"
                  value={newPartner.name}
                  onChange={e => setNewPartner({...newPartner, name: e.target.value})}
                  placeholder="e.g. Global Tech Solutions"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Email Address</label>
                <input 
                  type="email" 
                  className="block w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 focus:ring-4 focus:ring-slate-900/5 outline-none text-slate-900 font-bold transition shadow-sm"
                  value={newPartner.email}
                  onChange={e => setNewPartner({...newPartner, email: e.target.value})}
                  placeholder="partner@network.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Injected Capital (৳)</label>
                  <input 
                    type="number" 
                    className="block w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 focus:ring-4 focus:ring-slate-900/5 outline-none text-slate-900 font-bold transition shadow-sm"
                    value={newPartner.investmentAmount}
                    onChange={e => setNewPartner({...newPartner, investmentAmount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Profit Yield (%)</label>
                  <input 
                    type="number" 
                    className="block w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 focus:ring-4 focus:ring-slate-900/5 outline-none text-slate-900 font-bold transition shadow-sm"
                    value={newPartner.profitSharePercentage}
                    onChange={e => setNewPartner({...newPartner, profitSharePercentage: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 text-slate-500 hover:bg-slate-50 transition rounded-2xl font-black text-xs uppercase tracking-widest italic border border-slate-200">Cancel</button>
              <button onClick={handleAddPartner} className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:bg-emerald-600 transition text-xs uppercase tracking-widest italic">Initialize Partner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
