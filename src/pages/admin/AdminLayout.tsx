import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { Home, Users, FileText, ShoppingBag, PieChart, Settings, ShoppingCart, Globe, LogOut, Menu, X, ArrowLeft, TrendingUp, Tag } from 'lucide-react';
import { auth, db } from '../../lib/firebase.ts';
import { signOut } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function AdminLayout() {
  const { user, authReady } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingImportRequestsCount, setPendingImportRequestsCount] = useState(0);

  useEffect(() => {
    if (!user?.isAdmin) return;

    const qOrders = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setPendingOrdersCount(snapshot.size);
    });

    const qImports = query(collection(db, 'importRequests'), where('status', '==', 'pending'));
    const unsubscribeImports = onSnapshot(qImports, (snapshot) => {
      setPendingImportRequestsCount(snapshot.size);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeImports();
    };
  }, [user]);

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: PieChart },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Insights', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Import Req', path: '/admin/import-requests', icon: Globe },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Invoices', path: '/admin/invoices', icon: FileText },
    { name: 'Promos', path: '/admin/promos', icon: Tag },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isSubPage = location.pathname !== '/admin';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-8">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">iG</div>
          <span className="text-xl font-bold tracking-tight text-white italic uppercase">Central</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const displayName = item.name === 'Dashboard' ? 'Control Center' : item.name;
          const badgeCount = item.name === 'Orders' ? pendingOrdersCount : item.name === 'Import Req' ? pendingImportRequestsCount : 0;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{displayName}</span>
              </div>
              {badgeCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg min-w-[18px] text-center shadow-lg shadow-rose-500/20 animate-pulse">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-2">
        <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition font-bold text-sm uppercase tracking-tighter">
          <Home className="w-5 h-5" />
          <span>Exit Admin</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition font-bold text-sm uppercase tracking-tighter"
        >
          <LogOut className="w-5 h-5" />
          <span>Deactivate Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           {isSubPage ? (
             <button onClick={() => navigate('/admin')} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <ArrowLeft className="w-6 h-6" />
             </button>
           ) : (
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <Menu className="w-6 h-6" />
             </button>
           )}
           <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">iG</div>
              <span className="font-bold italic text-sm uppercase">Secure</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           {isSubPage && (
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 bg-slate-50 rounded-lg">
                <Menu className="w-5 h-5" />
             </button>
           )}
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
           </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile Panel */}
      <aside className={`fixed md:sticky top-0 left-0 h-full w-72 bg-white z-[101] shadow-2xl md:shadow-none transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:border-r border-slate-200`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 md:p-10 pb-24 md:pb-10">
        {isSubPage && (
          <div className="flex md:flex items-center gap-2 mb-8 group cursor-pointer" onClick={() => navigate('/admin')}>
             <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
             </div>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Return to Central Control</span>
          </div>
        )}
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl z-50 flex items-center justify-around p-2">
        <Link 
          to="/admin" 
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${location.pathname === '/admin' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Control</span>
        </Link>
        <Link 
          to="/admin/orders" 
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${location.pathname === '/admin/orders' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Orders</span>
        </Link>
        <Link 
          to="/admin/products" 
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${location.pathname === '/admin/products' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Stock</span>
        </Link>
        <Link 
          to="/admin/users" 
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${location.pathname === '/admin/users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Users</span>
        </Link>
        <Link 
          to="/admin/invoices" 
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${location.pathname === '/admin/invoices' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Invoice</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center p-3 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">System</span>
        </button>
      </nav>
    </div>
  );
}
