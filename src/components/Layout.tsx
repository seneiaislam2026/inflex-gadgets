import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { X, Home, Truck, User, Headphones, LogIn, MessageCircle } from 'lucide-react';
import { useBannerStore } from '../store/bannerStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import ScrollToTop from './ScrollToTop.tsx';

export default function Layout() {
  const { user } = useAuthStore();
  const { showBanner, setShowBanner, bannerText, bannerTag, topBannerImageUrl } = useBannerStore();
  const [userDismissed, setUserDismissed] = useState(false);
  const location = useLocation();

  const isVisible = showBanner && !userDismissed;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 md:pb-0">
      <ScrollToTop />
      {isVisible && (
        <div className="relative">
          {topBannerImageUrl ? (
            <div className="w-full relative shadow-sm">
               <img src={topBannerImageUrl} alt="Promotional Banner" className="w-full h-auto max-h-[140px] sm:max-h-[200px] object-cover" />
               <button 
                 onClick={() => setUserDismissed(true)}
                 className="absolute right-2 top-2 p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors z-10"
                 aria-label="Close banner"
               >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
               </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between sm:justify-center">
                 <div className="flex items-center space-x-2 w-full justify-center text-center">
                     {bannerTag && <span className="bg-emerald-500/30 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold whitespace-nowrap">{bannerTag}</span>}
                     {bannerText && <span className="text-xs sm:text-sm font-medium pr-6 sm:pr-0 truncate">{bannerText}</span>}
                 </div>
                 
                 <button 
                   onClick={() => setUserDismissed(true)}
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                   aria-label="Close banner"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )}
        </div>
      )}
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      
      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/8801987654321" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group flex items-center justify-center"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute right-full mr-3 bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100">
          Chat on WhatsApp
        </span>
      </a>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center py-2 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link to="/" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/') ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/track" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/track') ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>
          <Truck className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Track</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/profile') ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>
          <User className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
        {!user ? (
          <Link to="/login" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/login') ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>
            <LogIn className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        ) : (
          <Link to="/support" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/support') ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>
            <Headphones className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Support</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
