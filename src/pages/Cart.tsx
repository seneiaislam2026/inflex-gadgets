import { useCartStore } from '../store/cartStore.ts';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
           <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 font-medium">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/shop" 
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all inline-flex items-center shadow-xl shadow-emerald-600/20 active:scale-95"
        >
          Explore Collection <ArrowRight className="ml-2 w-5 h-5"/>
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 border-t border-slate-100">
      <div className="flex items-center justify-between mb-10">
         <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Shopping Cart</h1>
         <Link to="/shop" className="hidden sm:inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-widest transition">
           <ArrowLeft className="w-4 h-4 mr-2"/> Continue Shopping
         </Link>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          <ul className="divide-y divide-slate-100 border-t border-slate-200">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.li 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item._id} 
                  className="py-8 flex sm:py-10 group"
                >
                  <div className="flex-shrink-0 bg-slate-50 rounded-[2rem] p-4 border border-slate-100 shadow-sm flex items-center justify-center min-w-[7rem] sm:min-w-[9rem] relative overflow-hidden group-hover:border-emerald-200 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent mix-blend-overlay"></div>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-2xl object-center object-cover sm:w-28 sm:h-28 mix-blend-multiply drop-shadow-md group-hover:scale-105 transition-transform duration-500 relative z-10"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-slate-200 relative z-10" />
                    )}
                  </div>

                  <div className="ml-6 flex-1 flex flex-col justify-center sm:ml-8">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-base sm:text-lg">
                            <Link to={`/product/${item._id}`} className="font-bold text-slate-900 hover:text-emerald-600 transition tracking-tight">
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        <p className="mt-2 text-xl font-black text-emerald-600 tracking-tight">৳{item.price}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9 flex flex-col sm:items-end justify-center">
                        <div className="flex items-center border border-slate-200 rounded-xl w-max bg-white shadow-sm overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            className="px-4 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition active:bg-slate-100"
                          >
                            <Minus className="w-4 h-4"/>
                          </button>
                          <span className="px-4 py-2 text-base font-bold text-slate-900 min-w-[3rem] text-center border-x border-slate-100">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="px-4 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition active:bg-slate-100"
                          >
                            <Plus className="w-4 h-4"/>
                          </button>
                        </div>

                        <div className="absolute top-0 right-0 sm:top-1/2 sm:-translate-y-1/2">
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="-m-2 p-3 inline-flex text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                          >
                            <span className="sr-only">Remove</span>
                            <Trash2 className="w-5 h-5"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        {/* Order summary */}
        <section className="mt-16 bg-slate-50 rounded-[2.5rem] px-6 py-8 sm:p-10 lg:mt-0 lg:col-span-5 border border-slate-200 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Order Summary</h2>

          <dl className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium">Subtotal</dt>
              <dd className="text-base font-bold text-slate-900">৳{cartTotal().toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <dt className="flex items-center text-sm font-medium">Delivery Fee</dt>
              <dd className="font-bold text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest bg-slate-200/50 px-2 py-1 rounded-md">Calculated at checkout</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-900 pt-4">
              <dt className="text-base font-black text-slate-900">Total</dt>
              <dd className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">৳{cartTotal().toFixed(2)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <button
              onClick={handleCheckout}
              className="w-full bg-slate-900 rounded-xl shadow-md py-3.5 px-4 text-base font-bold text-white hover:bg-slate-800 transition active:scale-[0.98] flex items-center justify-center group"
            >
              Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
          <div className="mt-4 text-center">
             <Link to="/shop" className="sm:hidden inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition">
               Continue Shopping
             </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
