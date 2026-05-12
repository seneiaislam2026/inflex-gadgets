import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFetchProducts } from '../hooks/useFetchProducts.ts';
import { ArrowRight, ShoppingCart, Star, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useBannerStore } from '../store/bannerStore.ts';
import { motion } from 'motion/react';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const STAGGER_CHILDREN_VARIANTS = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const { products, loading } = useFetchProducts();
  const { addToCart } = useCartStore();
  const { heroImageUrl, heroImageUrls, isHeroEnabled } = useBannerStore();
  const validBanners = heroImageUrls?.filter(Boolean) || [];
  const bannersToDisplay = validBanners.length > 0 ? validBanners : (heroImageUrl ? [heroImageUrl] : []);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (bannersToDisplay.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % bannersToDisplay.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannersToDisplay.length]);

  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const newArrivals = products.slice(0, 4);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)];

  return (
    <div className="pb-20">
      
      {/* Hero Banner Area */}
      {isHeroEnabled && bannersToDisplay.length > 0 && (
         <div className="w-full relative">
            <Link to="/shop" className="block w-full relative group">
               <div className="w-full relative flex items-center justify-center">
                 {/* Invisible image to set natural height based on the first banner */}
                 <img src={bannersToDisplay[0]} className="w-full h-auto opacity-0 pointer-events-none" aria-hidden="true" alt="placeholder" />
                 
                 {bannersToDisplay.map((banner, idx) => (
                    <motion.img 
                      key={idx}
                      src={banner} 
                      alt={`Hero Promotion ${idx + 1}`} 
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: idx === currentBanner ? 1 : 0 }}
                      transition={{ duration: 0.8 }}
                    />
                 ))}
                 <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
               </div>
            </Link>
            {bannersToDisplay.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {bannersToDisplay.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                       e.preventDefault();
                       setCurrentBanner(idx);
                    }}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      idx === currentBanner ? 'bg-[#CFA670] w-5 sm:w-8' : 'bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            )}
         </div>
      )}

      {/* Shop by Category */}
      <section className="py-12 sm:py-16">
         <div className="text-center mb-8">
            <p className="text-[10px] font-bold text-[#CFA670] uppercase tracking-[0.2em] mb-2">Curated Selection</p>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">Shop by Category</h2>
         </div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto pb-6 gap-4 sm:gap-6 snap-x hide-scrollbar">
               {categories.filter(c => c !== 'all').map((cat: any) => {
                  const catProduct = products.find(p => p.category === cat);
                  const bgImage = catProduct?.images?.[0] || "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80";
                  return (
                    <Link 
                      key={cat} 
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      className="snap-start shrink-0 relative overflow-hidden rounded-xl w-[220px] h-[300px] sm:w-[260px] sm:h-[340px] group block shadow-md"
                    >
                       <img src={bgImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={cat} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                       <div className="absolute bottom-6 left-6 right-6">
                         <p className="text-[9px] font-bold text-[#CFA670] uppercase tracking-widest mb-1.5 drop-shadow-sm">Explore Collection</p>
                         <h3 className="text-xl sm:text-2xl font-light text-white tracking-widest uppercase drop-shadow-sm">{cat}</h3>
                       </div>
                    </Link>
                  );
               })}
            </div>
         </div>
      </section>

      {/* Featured Drops Section */}
      <section className="py-12 sm:py-16">
         <div className="text-center mb-10">
            <p className="text-[10px] font-bold text-[#CFA670] uppercase tracking-[0.2em] mb-2">Our Masterworks</p>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">Featured Collections</h2>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
               {featured.length > 0 ? featured.map((product, idx) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   key={product._id} 
                   className="bg-white flex flex-col group relative shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                 >
                   <Link to={`/product/${product._id}`} className="aspect-square overflow-hidden bg-[#eaf4fc]/20 flex items-center justify-center relative p-6 block">
                     <div className="absolute top-3 left-3 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full z-20">
                       Featured
                     </div>
                     {product.images?.[0] ? (
                       <img 
                         src={product.images[0]} 
                         alt={product.name} 
                         className="w-full h-full object-cover mix-blend-multiply drop-shadow-md"
                       />
                     ) : (
                       <ShoppingCart className="w-10 h-10 text-slate-200" />
                     )}
                   </Link>
                   <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white">
                     <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest mb-1 truncate">{product.category}</p>
                     <Link to={`/product/${product._id}`}>
                       <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight line-clamp-2 hover:text-slate-600 transition-colors">{product.name}</h4>
                     </Link>
                     <div className="flex items-center gap-1 mt-2 mb-4">
                       <div className="flex">
                         <Star className="w-3 h-3 fill-[#CFA670] text-[#CFA670]" />
                         <Star className="w-3 h-3 fill-[#CFA670] text-[#CFA670]" />
                         <Star className="w-3 h-3 fill-[#CFA670] text-[#CFA670]" />
                         <Star className="w-3 h-3 fill-[#CFA670] text-[#CFA670]" />
                         <Star className="w-3 h-3 fill-slate-200 text-slate-200" />
                       </div>
                       <span className="text-[10px] font-medium text-slate-400 mt-0.5">(124)</span>
                     </div>
                     <div className="flex items-center justify-between mt-auto pt-4 gap-2">
                        <div className="flex flex-col min-w-0">
                           {product.discountPrice && product.discountPrice < product.price ? (
                             <div className="flex items-center gap-2">
                               <span className="text-sm font-bold text-slate-900 truncate">৳{product.discountPrice}</span>
                               <span className="text-[10px] text-slate-400 line-through font-medium truncate">৳{product.price}</span>
                             </div>
                           ) : (
                             <span className="text-sm font-bold text-slate-900 truncate">৳{product.price}</span>
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
                         className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-[#CFA670] transition-colors active:scale-95"
                       >
                         <ShoppingBag className="w-4 h-4 mb-[1px]" />
                       </button>
                     </div>
                   </div>
                 </motion.div>
               )) : (
                 <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 border border-slate-100">No featured products found.</div>
               )}
             </div>
           )}
           <div className="mt-8 text-center sm:hidden">
             <Link to="/shop" className="inline-flex items-center justify-center w-full py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs">
                View All Products
             </Link>
           </div>
         </div>
      </section>

    </div>
  );
}

