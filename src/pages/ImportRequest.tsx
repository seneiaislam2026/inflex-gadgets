import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore.ts';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase.ts';
import { collection, addDoc } from 'firebase/firestore';
import { Globe, Package, Camera, Send, CheckCircle, ShieldCheck, Zap, Truck, Navigation2, ArrowRight } from 'lucide-react';

export default function ImportRequest() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    productPhoto: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login first to submit a request');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'importRequests'), {
        ...formData,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Mission Accepted!</h1>
        <p className="text-slate-500 mb-8 text-lg font-medium">Our global sourcing agents are now tracking down your item. Check your profile for status updates within 24 hours.</p>
        <button 
          onClick={() => navigate('/profile')}
          className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 uppercase tracking-widest text-sm italic"
        >
          Track Progress
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Improved Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100">
               <Globe className="w-4 h-4" />
               Global Shopping Hub
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
              Shop from <span className="text-emerald-600">USA, UK & China</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Can't find a product in Bangladesh? No problem. Just send us the details, and we'll bring it to your doorstep safely.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Form Side */}
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100%] z-0"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Request an Item</h2>
                <p className="text-sm font-medium text-slate-500">Fill in the product details below to get a custom quote.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Product Name</label>
                   <input 
                     type="text" 
                     required
                     placeholder="e.g. Apple Watch Ultra 2"
                     className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition font-bold"
                     value={formData.productName}
                     onChange={e => setFormData({...formData, productName: e.target.value})}
                   />
                </div>

                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Photo/Link URL (Optional)</label>
                   <div className="relative">
                     <Camera className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input 
                       type="url" 
                       placeholder="https://example.com/product"
                       className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition font-bold"
                       value={formData.productPhoto}
                       onChange={e => setFormData({...formData, productPhoto: e.target.value})}
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Specifications</label>
                   <textarea 
                     rows={4}
                     placeholder="Mention color, size, storage, or any other details..."
                     className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition font-bold resize-none"
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   ></textarea>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-2">
                   <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                     <span className="text-amber-900 uppercase">Note:</span> Quotations are sent within 24 hours. Final price includes all taxes and delivery charges to your location.
                   </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3 group uppercase tracking-widest text-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  {loading ? 'Sending...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Steps Side */}
          <div className="space-y-8">
            <div>
               <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight italic">How it works</h3>
               <div className="space-y-6">
                 {[
                   { 
                     title: 'Request Submission', 
                     subtitle: 'অনুরোধ পাঠান',
                     desc: 'You send us what you want with specific details.',
                     icon: Send,
                     color: 'bg-blue-500'
                   },
                   { 
                     title: 'Expert Sourcing', 
                     subtitle: 'সোর্সিং প্রক্রিয়া',
                     desc: 'Our global team finds the best price from verified sellers.',
                     icon: Globe,
                     color: 'bg-emerald-500'
                   },
                   { 
                     title: 'Safe Delivery', 
                     subtitle: 'নিরাপদ ডেলিভারি',
                     desc: 'We handle customs and bring it to your door in BD.',
                     icon: Truck,
                     color: 'bg-slate-900'
                   }
                 ].map((step, i) => (
                   <div key={i} className="flex gap-6 group">
                     <div className={`w-14 h-14 rounded-2xl ${step.color} flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <step.icon className="w-7 h-7 text-white" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-0.5">{i + 1}. {step.title}</h4>
                        <p className="text-[10px] font-bold text-emerald-600 mb-1">{step.subtitle}</p>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{step.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-lg font-black uppercase mb-2">Need Immediate Help?</h3>
                 <p className="text-emerald-100 text-sm mb-6">Talk to our global agents for bulk orders or urgent sourcing.</p>
                 <button onClick={() => navigate('/support')} className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                    Contact Now <ArrowRight className="w-3 h-3" />
                 </button>
               </div>
               <Globe className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
