import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">iG</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Inflex<span className="text-emerald-600 font-medium tracking-normal">Gadgets</span></span>
            </Link>
            <p className="text-slate-500 text-sm">
              Premium electronics and gadgets for the modern world. We bring you the best tech first.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/shop?category=smartphones" className="hover:text-emerald-600 transition">Smartphones</Link></li>
              <li><Link to="/shop?category=audio" className="hover:text-emerald-600 transition">Audio</Link></li>
              <li><Link to="/shop?category=wearables" className="hover:text-emerald-600 transition">Wearables</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-emerald-600 transition">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-emerald-600 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition">Contact</Link></li>
              <li><Link to="/partner" className="hover:text-emerald-600 transition">Partner With Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Newsletter</h3>
            <p className="text-sm text-slate-500 mb-4">Subscribe for the latest drops and deals.</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="px-4 py-2 w-full border border-slate-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-900 text-sm" />
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-r-md hover:bg-emerald-500 transition text-sm font-bold">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Inflex Gadgets. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-slate-400">
            {/* Social icons */}
          </div>
        </div>
      </div>
    </footer>
  );
}
