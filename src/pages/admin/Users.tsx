import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { Users, Mail, Search, Shield, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        _id: doc.id, 
        ...doc.data()
      }));
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isAdmin: !currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Customer Base</h1>
          <p className="text-slate-500 font-medium">Manage your platform customers and their access levels.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
               type="text" 
               placeholder="Search customers..."
               className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 outline-none transition shadow-sm"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Identity</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Level</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">System Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name || 'Anonymous User'}</div>
                        <div className="text-[10px] font-bold text-slate-400 italic">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    {user.isAdmin ? (
                      <span className="px-3 py-1 inline-flex text-[9px] font-black rounded-lg bg-indigo-100 text-indigo-700 uppercase tracking-widest border border-indigo-200">
                         Admin Protocol
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-[9px] font-black rounded-lg bg-emerald-100 text-emerald-700 uppercase tracking-widest border border-emerald-200">
                         Standard User
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleAdmin(user._id, user.isAdmin)}
                        className={`p-2 rounded-lg transition-all ${user.isAdmin ? 'text-rose-500 hover:bg-rose-50' : 'text-indigo-500 hover:bg-indigo-50'}`}
                        title={user.isAdmin ? "Remove Admin Privileges" : "Grant Admin Privileges"}
                      >
                        {user.isAdmin ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !loading && (
             <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest italic">No customers detected in logs</div>
          )}
        </div>
      </div>
    </div>
  );
}
