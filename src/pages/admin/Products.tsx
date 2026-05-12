import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Upload, Link as LinkIcon } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const initialFormData = {
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: '',
    stock: 0,
    images: [''],
    isFeatured: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const categories = [
    { id: 'audio', name: 'Audio' },
    { id: 'smartphones', name: 'Smartphones' },
    { id: 'smartwatches', name: 'Smartwatches' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'tv', name: 'Smart TV' },
    { id: 'laptop', name: 'Laptops' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File size exceeds 1MB limit.");
      return;
    }

    const reader = new FileReader();
    setUploading(true);
    reader.onloadend = () => {
      setFormData({ ...formData, images: [reader.result as string] });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbProducts = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      setProducts(dbProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      setShowModal(false);
      setFormData(initialFormData);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      category: product.category,
      stock: product.stock || 0,
      images: product.images,
      isFeatured: product.isFeatured || false
    });
    setEditingId(product._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Management</h1>
          <p className="text-slate-500">Add, edit or remove store products</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData(initialFormData); setShowModal(true); }} 
          className="w-full md:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5"/> Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden backdrop-blur-sm">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Final Price</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading products...</td></tr>
              ) : products.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg flex-shrink-0 overflow-hidden bg-slate-100 border border-slate-200">
                        {product.images?.[0] ? (
                          <img className="h-full w-full object-cover" src={product.images[0]} alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900">{product.name}</div>
                        {product.isFeatured && <span className="text-[8px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[10px] font-black text-slate-500 uppercase px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                       <span className="text-xs font-black text-slate-700">{product.stock || 0} Units</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{product.stock > 0 ? 'In Inventory' : 'Depleted'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 line-through">৳{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-black tracking-tight">৳{(product.discountPrice || product.price).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleEdit(product)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition"><Edit className="w-4 h-4"/></button>
                       <button onClick={() => handleDelete(product._id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card-Based Grid */}
        <div className="md:hidden p-4 grid grid-cols-1 gap-4">
           {loading ? (
             <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest italic">Scanning Records...</div>
           ) : products.map(product => (
             <div key={product._id} className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm flex flex-col items-start gap-4 group">
               <div className="flex items-center gap-4 w-full">
                 <div className="relative w-20 h-20 shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                         <Plus className="w-8 h-8" />
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-1 right-1 bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm">HOT</div>
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{product.category}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 break-words tracking-tight uppercase italic leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-base font-black text-emerald-600 tracking-tight">৳{(product.discountPrice || product.price).toLocaleString()}</span>
                       <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100">
                          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          <span className="text-[9px] font-black italic">{product.stock || 0} STK</span>
                       </div>
                    </div>
                 </div>
               </div>
               <div className="flex items-center gap-3 w-full">
                  <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-emerald-400 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all text-[10px] font-black uppercase italic tracking-widest">
                     <Edit className="w-4 h-4"/> Modify Unit
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl active:scale-95 transition-all">
                     <Trash2 className="w-4 h-4"/>
                  </button>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* Modern Full-Screen Mobile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] md:flex md:items-center md:justify-center">
          <div className="absolute inset-0 bg-slate-900/40 md:bg-black/60 backdrop-blur-md md:backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-xl h-full md:h-auto md:max-h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">System Protocol</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{editingId ? 'Edit Product' : 'New Product'}</h2>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all active:scale-95"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 pb-32 md:pb-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Identity of Product*</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 outline-none text-slate-900 font-bold transition text-sm" placeholder="e.g. Sony WH-1000XM5" />
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Market Price (৳)*</label>
                     <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="block w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 focus:border-slate-900 focus:bg-white outline-none text-slate-900 font-black transition text-sm" />
                    </div>
                    <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Offer Price (৳)</label>
                     <input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: Number(e.target.value)})} className="block w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 focus:border-slate-900 focus:bg-white outline-none text-emerald-600 font-black transition text-sm" />
                    </div>
                    <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Inventory Stock*</label>
                     <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="block w-full rounded-2xl bg-slate-50 border border-emerald-200 px-5 py-4 focus:border-emerald-600 focus:bg-white outline-none text-emerald-700 font-black transition text-sm" />
                    </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Classification*</label>
                   <button 
                     type="button"
                     onClick={() => setShowCategorySelector(true)}
                     className="flex items-center justify-between w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 text-slate-900 font-black transition text-sm uppercase tracking-widest hover:bg-slate-100"
                   >
                     <span>{formData.category ? categories.find(c => c.id === formData.category)?.name : 'Select Classification'}</span>
                     <div className="w-5 h-5 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Plus className="w-3 h-3 text-slate-500" />
                     </div>
                   </button>

                   {/* Custom System-Style Selector Modal */}
                   {showCategorySelector && (
                     <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 backdrop-blur-md">
                        <div className="absolute inset-0 bg-slate-900/60" onClick={() => setShowCategorySelector(false)}></div>
                        <div className="relative bg-slate-900 w-full max-w-sm rounded-t-[3rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
                           <div className="p-8">
                              <div className="flex justify-between items-center mb-6">
                                 <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">System Protocol</p>
                                    <h3 className="text-xl font-black text-white italic uppercase">Select Category</h3>
                                 </div>
                                 <button onClick={() => setShowCategorySelector(false)} className="p-2 bg-white/5 text-white/50 rounded-xl">
                                    <X className="w-5 h-5" />
                                 </button>
                              </div>

                              <div className="space-y-2">
                                 {categories.map((cat) => (
                                    <button
                                      key={cat.id}
                                      onClick={() => {
                                        setFormData({...formData, category: cat.id});
                                        setShowCategorySelector(false);
                                      }}
                                      className={`w-full flex items-center justify-between p-5 rounded-2xl transition border ${formData.category === cat.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}
                                    >
                                       <span className="font-black italic uppercase tracking-widest">{cat.name}</span>
                                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.category === cat.id ? 'border-white bg-white' : 'border-slate-700'}`}>
                                          {formData.category === cat.id && <div className="w-2 h-2 rounded-full bg-emerald-600"></div>}
                                       </div>
                                    </button>
                                 ))}
                              </div>

                              <button 
                                onClick={() => setShowCategorySelector(false)}
                                className="w-full mt-6 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest italic text-xs shadow-xl active:scale-95 transition-all"
                              >
                                Confirm Selection
                              </button>
                           </div>
                        </div>
                     </div>
                   )}
                 </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Media Assets</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          className="hidden" 
                          id="product-upload" 
                        />
                        <label 
                          htmlFor="product-upload"
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer group"
                        >
                           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="w-5 h-5 text-emerald-500" />
                           </div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{uploading ? 'Processing...' : 'Local File'}</span>
                        </label>
                     </div>
                     <div className="relative">
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-slate-100 bg-slate-50 rounded-3xl h-full">
                           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                              <Plus className="w-5 h-5 text-indigo-500" />
                           </div>
                           <input 
                             type="text" 
                             placeholder="PASTE IMAGE URL"
                             value={formData.images[0]?.startsWith('data:') ? '' : formData.images[0]} 
                             onChange={e => setFormData({...formData, images: [e.target.value]})} 
                             className="w-full text-center text-[10px] bg-transparent outline-none font-black text-slate-900 placeholder:text-slate-300 uppercase tracking-widest" 
                           />
                        </div>
                     </div>
                  </div>

                  {formData.images[0] && (
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 inline-flex">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-white">
                        <img src={formData.images[0] || undefined} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          onClick={() => setFormData({...formData, images: ['']})}
                          className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg shadow-lg active:scale-95"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="featured-toggle"
                    checked={formData.isFeatured} 
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
                    className="w-6 h-6 text-slate-900 border-slate-300 rounded-xl focus:ring-slate-900/10 cursor-pointer"
                  />
                  <label htmlFor="featured-toggle" className="ml-4 text-xs font-black text-slate-900 tracking-tight italic uppercase cursor-pointer">Boost to Featured Section</label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-6 md:p-8">
              <button 
                onClick={handleSave} 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-2xl shadow-slate-900/30 hover:bg-emerald-600 transition-all tracking-[0.2em] italic uppercase text-sm"
              >
                {editingId ? 'Deploy Upgrades' : 'Sync to Terminal'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
