import { useFetchProducts } from '../hooks/useFetchProducts.ts';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ShoppingBag, Search, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/cartStore.ts';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Shop() {
  const { products, loading } = useFetchProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCartStore();
  
  const categoryFilter = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)];

  const filteredProducts = products.filter(p => {
    const matchCat = categoryFilter === 'all' ? true : p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
         <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Our Collection</h1>
            <p className="text-slate-500 font-medium">Browse our premium lifestyle products.</p>
         </div>
         
         <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar snap-x">
             {categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setSearchParams(searchQuery ? { category: String(cat), q: searchQuery } : { category: String(cat) })}
                 className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-all ${
                   categoryFilter === cat 
                     ? 'bg-slate-900 text-white shadow-md' 
                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                 }`}
               >
                 {cat === 'all' ? 'All Products' : cat}
               </button>
             ))}
         </div>
      </div>

      {searchQuery && (
         <div className="mb-8 flex items-center justify-between bg-emerald-50 text-emerald-900 px-4 py-3 rounded-xl border border-emerald-100">
           <p className="font-medium text-sm">Showing results for: <span className="font-bold">"{searchQuery}"</span></p>
           <button 
             onClick={() => setSearchParams({ category: categoryFilter })} 
             className="text-emerald-700 hover:text-emerald-900 text-sm font-bold underline"
           >
             Clear Search
           </button>
         </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div></div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
               <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
               <h3 className="text-2xl font-bold text-slate-700">No products found</h3>
               <p className="text-slate-500 mt-2">Try adjusting your search or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <AnimatePresence>
                {filteredProducts.map((product, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={product._id} 
                    className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-100 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1"
                  >
                    <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-slate-50 p-6 flex flex-col justify-center items-center">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 mix-blend-overlay"></div>
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700 relative z-0 mix-blend-multiply drop-shadow-xl"
                        />
                      ) : (
                        <ShoppingBag className="w-12 h-12 text-slate-200 relative z-0" />
                      )}
                      {product.discountPrice && product.discountPrice < product.price && (
                        <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg z-20 uppercase tracking-widest">
                          Sale
                        </div>
                      )}
                    </Link>
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <p className="text-[9px] sm:text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1 truncate">{product.category}</p>
                      <Link to={`/product/${product._id}`}>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight line-clamp-2 hover:text-emerald-600 transition-colors mb-3 sm:mb-4">{product.name}</h4>
                      </Link>
                      <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100 gap-2">
                         <div className="flex flex-col min-w-0">
                            {product.discountPrice && product.discountPrice < product.price ? (
                              <>
                                <span className="text-base sm:text-lg font-black text-slate-900 truncate">৳{product.discountPrice}</span>
                                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-bold mt-0.5 truncate">৳{product.price}</span>
                              </>
                            ) : (
                              <span className="text-base sm:text-lg font-black text-slate-900 truncate">৳{product.price}</span>
                            )}
                         </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                               _id: product._id,
                               name: product.name,
                               price: product.discountPrice || product.price,
                               image: product.images[0],
                               quantity: 1
                            });
                          }}
                          className="w-8 sm:w-10 h-8 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-[14px] bg-slate-900 text-white hover:bg-emerald-500 transition-colors shadow-md active:scale-95"
                        >
                          <ShoppingBag className="w-4 h-4 sm:w-4 sm:h-4 ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
