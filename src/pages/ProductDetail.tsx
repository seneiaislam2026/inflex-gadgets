import { useParams, Link } from 'react-router-dom';
import { useFetchProducts } from '../hooks/useFetchProducts.ts';
import { useCartStore } from '../store/cartStore.ts';
import { useState } from 'react';
import { ArrowLeft, ShoppingBag, Shield, Truck, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useFetchProducts();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p._id === id);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div></div>;
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Product not found</h2>
        <Link to="/shop" className="mt-4 text-emerald-600 font-bold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 text-slate-900 border-t border-slate-100">
      <Link to="/shop" className="inline-flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-emerald-600 mb-10 transition">
        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Collection
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden flex items-center justify-center p-8 lg:p-12 border border-slate-200 shadow-2xl relative"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent mix-blend-overlay"></div>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-2xl relative z-10 drop-shadow-2xl mix-blend-multiply transition-transform duration-700 hover:scale-105" />
          ) : (
            <ShoppingBag className="w-32 h-32 text-slate-200 relative z-10" />
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col justify-center"
        >
          <p className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">{product.category}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">{product.name}</h1>
          <div className="mb-8">
            {product.discountPrice && product.discountPrice < product.price ? (
              <div className="flex items-center space-x-4">
                <p className="text-4xl font-black text-emerald-600">৳{product.discountPrice}</p>
                <div className="flex flex-col">
                   <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-0.5">Save ৳{product.price - product.discountPrice}</p>
                   <p className="text-lg font-bold text-slate-400 line-through leading-none">৳{product.price}</p>
                </div>
              </div>
            ) : (
              <p className="text-4xl font-black text-slate-900">৳{product.price}</p>
            )}
          </div>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
            {product.description}
          </p>
          
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <span className="font-bold text-slate-900">Quantity</span>
               <span className={product.stock > 0 ? "text-emerald-600 font-bold text-sm" : "text-rose-500 font-bold text-sm"}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
               </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex w-full sm:w-auto items-center justify-between border-2 border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-6 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition active:bg-slate-100">-</button>
                <span className="px-6 py-4 font-black text-slate-900 min-w-[3.5rem] text-center text-lg">{quantity}</span>
                <button onClick={() => setQuantity(Math.max(1, Math.min(product.stock, quantity + 1)))} className="px-6 py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition active:bg-slate-100">+</button>
              </div>
              <button 
                onClick={() => addToCart({
                  _id: product._id,
                  name: product.name,
                  price: product.discountPrice || product.price,
                  image: product.images[0],
                  quantity
                })}
                disabled={product.stock <= 0}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98] flex justify-center items-center space-x-3 uppercase tracking-widest text-sm"
              >
                <ShoppingBag className="w-5 h-5"/>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 leading-tight">1 Year<br/>Warranty</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 leading-tight">Fast N.W.<br/>Delivery</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 leading-tight">7 Days<br/>Return Info</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
