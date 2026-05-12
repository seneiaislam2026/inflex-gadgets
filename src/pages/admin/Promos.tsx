import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { Tag, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage', // or 'fixed'
    value: 10,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'promos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPromos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code.trim()) return;
    setIsSubmitting(true);
    try {
      const code = newPromo.code.trim().toUpperCase();
      await setDoc(doc(db, 'promos', code), {
        type: newPromo.type,
        value: Number(newPromo.value),
        isActive: newPromo.isActive,
        createdAt: new Date()
      });
      setNewPromo({ code: '', type: 'percentage', value: 10, isActive: true });
    } catch (err: any) {
      alert('Error creating promo: ' + err.message);
    }
    setIsSubmitting(false);
  };

  const toggleStatus = async (promo: any) => {
    try {
      await setDoc(doc(db, 'promos', promo.id), { ...promo, isActive: !promo.isActive });
    } catch (err: any) {
      alert('Error updating promo: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await deleteDoc(doc(db, 'promos', id));
    } catch (err: any) {
      alert('Error deleting promo: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Loading promos...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase mb-8">
        <Tag className="w-8 h-8 text-emerald-600" />
        Promo Codes
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Create Promo
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Code</label>
                <input 
                  type="text" 
                  required
                  value={newPromo.code}
                  onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 uppercase font-bold"
                  placeholder="e.g. SUMMER20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                  <select 
                    value={newPromo.type}
                    onChange={e => setNewPromo({...newPromo, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Value</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newPromo.value}
                    onChange={e => setNewPromo({...newPromo, value: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newPromo.isActive}
                  onChange={e => setNewPromo({...newPromo, isActive: e.target.checked})}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-slate-700">Active</span>
              </label>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white rounded-xl py-4 font-black tracking-widest uppercase transition-all shadow-lg hover:bg-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Save Promo Code'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Discount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {promos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No promo codes found</td>
                  </tr>
                ) : promos.map(promo => (
                  <tr key={promo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-black text-slate-900 px-3 py-1 bg-slate-100 rounded-lg">{promo.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-600">
                      {promo.type === 'percentage' ? `${promo.value}%` : `৳${promo.value}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(promo)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${promo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {promo.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
