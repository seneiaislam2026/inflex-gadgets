import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Smartphone, 
  Watch, 
  Headphones, 
  Tv, 
  Laptop, 
  Speaker, 
  Camera, 
  Home, 
  Cable,
  Package,
  TrendingUp,
  Award,
  MapPin,
  Headset,
  Globe,
  ChevronRight,
  LogOut,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase.ts';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../store/authStore.ts';
import { useBannerStore } from '../store/bannerStore.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainMenus = [
  { name: 'Order Track', path: '/track', icon: Package },
  { name: 'Campaign', path: '/shop', icon: Award },
  { name: 'Trending', path: '/shop', icon: TrendingUp },
  { name: 'Brands', path: '/shop', icon: Award },
  { name: 'Outlets', path: '/support', icon: MapPin },
  { name: 'Support', path: '/support', icon: Headset },
  { name: 'Import from Abroad', path: '/import-request', icon: Globe, highlight: true },
];

const categories = [
  { id: 'phones', name: 'Phones', icon: Smartphone, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'watches', name: 'Watches', icon: Watch, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'headphones', name: 'Earbuds', icon: Headphones, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'tv', name: 'Smart Home', icon: Home, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'tablet', name: 'Tablets', icon: Laptop, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'accessories', name: 'Accessories', icon: Cable, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=200&h=200&auto=format&fit=crop' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const { logoUrl } = useBannerStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[320px] bg-white z-[101] shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                 <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-0.5 text-orange-500 font-extrabold italic text-[16px] tracking-tighter leading-none mb-0.5">
                       <span>i</span>
                       <span className="text-orange-400">G</span>
                       <Star className="w-2 h-2 fill-orange-400 text-orange-400 -mt-1.5" />
                    </div>
                    <span className="text-lg sm:text-xl font-black tracking-widest text-slate-900 uppercase leading-none">Inflex</span>
                    <div className="flex items-center gap-1 mt-0.5">
                       <div className="h-[1px] w-2 bg-orange-400"></div>
                       <span className="text-[7px] sm:text-[8px] text-orange-400 font-bold uppercase tracking-[0.2em] leading-none">Gadgets</span>
                       <div className="h-[1px] w-2 bg-orange-400"></div>
                    </div>
                 </div>
              </Link>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="pb-10">
              {/* Main Menus */}
              <div className="bg-slate-900 px-6 py-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Menus</h3>
              </div>
              <div className="py-2">
                {mainMenus.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group ${
                      item.highlight ? 'bg-emerald-50 hover:bg-emerald-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-5 h-5 ${item.highlight ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`} />
                      <span className={`font-semibold text-[15px] ${item.highlight ? 'text-emerald-700' : 'text-slate-700'}`}>{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>

              {/* Categories Section - Google Style */}
              <div className="bg-amber-500 px-6 py-3">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Categories</h3>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={`/shop?category=${cat.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden shadow-sm">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-slate-700 group-hover:text-slate-900">{cat.name}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Additional List Style Categories */}
              <div className="px-6 py-2 pt-4">
                <div className="space-y-4">
                   <Link to="/shop?category=tv" onClick={onClose} className="flex items-center justify-between text-slate-600 hover:text-emerald-600 cursor-pointer py-2 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                         <Tv className="w-5 h-5" />
                         <span className="font-medium">Smart TV & Accessories</span>
                      </div>
                      <span className="text-xs text-slate-400">▼</span>
                   </Link>
                   <Link to="/shop?category=laptop" onClick={onClose} className="flex items-center justify-between text-slate-600 hover:text-emerald-600 cursor-pointer py-2 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                         <Laptop className="w-5 h-5" />
                         <span className="font-medium">Computer & Accessories</span>
                      </div>
                      <span className="text-xs text-slate-400">▼</span>
                   </Link>
                   <Link to="/shop?category=accessories" onClick={onClose} className="flex items-center justify-between text-slate-600 hover:text-emerald-600 cursor-pointer py-2 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                         <Speaker className="w-5 h-5" />
                         <span className="font-medium">Wireless Speakers</span>
                      </div>
                      <span className="text-xs text-slate-400">▼</span>
                   </Link>
                </div>
              </div>

              {/* User Section */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account</h3>
              </div>
              <div className="px-6 py-4">
                {user ? (
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                         <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                            {user.name?.[0] || user.email?.[0] || 'U'}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{user.name || 'User'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                         </div>
                      </div>
                      <Link to="/profile" onClick={onClose} className="flex gap-3 px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition text-sm">
                         Profile Settings
                      </Link>
                      {user.isAdmin && (
                        <Link to="/admin" onClick={onClose} className="flex gap-3 px-6 py-3 text-emerald-600 font-black hover:bg-emerald-50 rounded-xl transition text-sm italic italic uppercase">
                           Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition shadow-sm mt-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                   </div>
                ) : (
                   <Link
                     to="/login"
                     onClick={onClose}
                     className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition shadow-xl shadow-slate-900/20"
                   >
                     Login to Account
                   </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
