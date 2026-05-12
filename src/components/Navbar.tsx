import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Camera, MessageSquare, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore.ts';
import { useCartStore } from '../store/cartStore.ts';
import { useBannerStore } from '../store/bannerStore.ts';
import { auth, db } from '../lib/firebase.ts';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import Sidebar from './Sidebar.tsx';

export default function Navbar() {
  const { user } = useAuthStore();
  const { cart } = useCartStore();
  const { logoUrl } = useBannerStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [searchText, setSearchText] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRefDesktop = useRef<HTMLDivElement>(null);
  const dropdownRefMobile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setAllProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to fetch products for search", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRefDesktop.current && !dropdownRefDesktop.current.contains(e.target as Node) &&
          dropdownRefMobile.current && !dropdownRefMobile.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      setShowDropdown(false);
      navigate(`/shop?q=${encodeURIComponent(searchText.trim())}`);
      setSearchText('');
    }
  };

  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase())).slice(0, 5);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-3 bg-white/90 border-b border-slate-200 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Row */}
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu button moved to left */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link to="/" className="flex items-center gap-2">
                 <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-0.5 text-orange-500 font-extrabold italic text-xl tracking-tighter leading-none mb-0.5">
                       <span>i</span>
                       <span className="text-orange-400">G</span>
                       <Star className="w-2.5 h-2.5 fill-orange-400 text-orange-400 -mt-2" />
                    </div>
                    <span className="text-xl sm:text-2xl font-black tracking-widest text-slate-900 uppercase leading-none">Inflex</span>
                    <div className="flex items-center gap-1 mt-0.5">
                       <div className="h-[1px] w-3 bg-orange-400"></div>
                       <span className="text-[8px] sm:text-[9px] text-orange-400 font-bold uppercase tracking-[0.2em] leading-none">Gadgets</span>
                       <div className="h-[1px] w-3 bg-orange-400"></div>
                    </div>
                 </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={dropdownRefDesktop}>
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className={`flex w-full ${showDropdown && searchText ? 'bg-white shadow-md' : 'bg-slate-50'} border border-slate-200 rounded-lg overflow-hidden group focus-within:border-emerald-500/50 transition z-50 relative`}>
              <input 
                 type="text" 
                 placeholder="Search for products" 
                 className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-900 focus:outline-none placeholder:text-slate-400" 
                 value={searchText}
                 onChange={(e) => setSearchText(e.target.value)}
                 onFocus={() => setShowDropdown(true)}
              />
              <label className="px-3 flex items-center justify-center text-slate-500 hover:text-slate-700 transition group-focus-within:text-emerald-600 cursor-pointer">
                <Camera className="w-5 h-5"/>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    navigate('/shop');
                  }
                }} />
              </label>
              <button type="submit" className="px-5 bg-emerald-600 hover:bg-emerald-500 text-white transition"><Search className="w-5 h-5"/></button>
            </form>

            {/* Search Dropdown */}
            {showDropdown && searchText.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                {filteredProducts.length > 0 ? (
                  <div className="py-2">
                    {filteredProducts.map(p => (
                      <Link 
                        key={p.id} 
                        to={`/product/${p.id}`} 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition"
                      >
                         <div className="w-10 h-10 rounded border border-slate-100 overflow-hidden flex-shrink-0">
                           <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.name} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                            <p className="text-xs font-bold text-emerald-600">৳{p.price}</p>
                         </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">No products found for "{searchText}"</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 sm:space-x-5">
            <button className="text-slate-600 hover:text-slate-900 transition md:hidden" onClick={() => navigate('/shop')}>
              <Search className="h-6 w-6" />
            </button>
            <button className="text-slate-600 hover:text-slate-900 transition hidden sm:block">
              <MessageSquare className="h-5 w-5" />
            </button>
            
            <Link to="/cart" className="relative text-slate-600 hover:text-slate-900 transition">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 ? (
                <span className="absolute -top-1 -right-2 bg-emerald-500 text-white font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              ) : (
                 <span className="absolute -top-1 -right-2 bg-slate-200 text-slate-600 font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  0
                 </span>
              )}
            </Link>
            
            {user ? (
              <div className="hidden sm:flex items-center space-x-4">
                <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center space-x-1 text-slate-600 hover:text-slate-900">
                <User className="h-5 w-5" />
                <span className="text-sm font-bold">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      </nav>
    </>
  );
}
