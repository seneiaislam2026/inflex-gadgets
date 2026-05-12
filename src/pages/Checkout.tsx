import { useState, FormEvent } from 'react';
import { useCartStore } from '../store/cartStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { Book, Copy, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    upazila: '',
    district: '',
    mobile: user?.email && !user.email.includes('@') ? user.email : '',
    email: user?.email && user.email.includes('@') ? user.email : ''
  });
  const [loading, setLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(60);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const districts = [
    'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur', 'Narayanganj'
  ];

  const handleDistrictChange = (d: string) => {
    setAddress({ ...address, district: d });
    setDeliveryFee(d === 'Dhaka' ? 60 : 100);
  };

  const totalAmount = Math.max(0, cartTotal() - discountAmount) + deliveryFee;

  const handleApplyPromo = async () => {
    if(!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError('');
    try {
      const codeToUse = promoCode.trim().toUpperCase();
      const promoDoc = await getDoc(doc(db, 'promos', codeToUse));
      if (promoDoc.exists()) {
        const promoData = promoDoc.data();
        if (promoData.isActive) {
          let discount = 0;
          if (promoData.type === 'percentage') {
             discount = (cartTotal() * promoData.value) / 100;
          } else {
             discount = promoData.value;
          }
          setDiscountAmount(discount);
          setAppliedPromo(codeToUse);
        } else {
          setPromoError('This promo code is no longer active.');
          setDiscountAmount(0);
          setAppliedPromo('');
        }
      } else {
          setPromoError('Invalid promo code.');
          setDiscountAmount(0);
          setAppliedPromo('');
      }
    } catch(e) {
      setPromoError('Failed to verify promo code.');
    }
    setIsApplyingPromo(false);
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to place an order.");
      navigate('/login');
      return;
    }

    if (!address.district || !address.mobile || !address.street || !address.fullName) {
      alert("Please fill in all required delivery details.");
      return;
    }

    // BD Mobile validation
    if (!/^(01)[3-9][0-9]{8}$/.test(address.mobile.trim())) {
      alert("Please enter a valid 11-digit Bangladeshi mobile number.");
      return;
    }

    setLoading(true);

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let shortId = '';
    for (let i = 0; i < 6; i++) {
        shortId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const orderRef = doc(db, 'orders', shortId);

    const orderData = {
      userId: user.uid,
      status: 'pending',
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      source: 'website',
      deliveryAddress: address,
      paymentMethod: 'Cash on Delivery',
      deliveryFee,
      discountAmount,
      promoCode: appliedPromo || null,
      total: totalAmount,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await setDoc(orderRef, orderData);
      setSuccessOrderId(shortId);
      window.scrollTo(0, 0);
      clearCart();
    } catch (err: any) {
      console.error(err);
      alert('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successOrderId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Book className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500 mb-8 font-medium">Thank you for your purchase. Your order has been placed successfully.</p>
        
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 mb-8 shadow-xl overflow-hidden">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Order ID</p>
           <div className="flex flex-wrap items-center justify-center gap-3">
              <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter break-all">#{successOrderId}</p>
              <button 
                onClick={() => copyToClipboard(successOrderId)}
                className={`p-2 rounded-xl transition-all flex-shrink-0 ${isCopying ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {isCopying ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
           </div>
        </div>

        <div className="flex flex-col gap-3">
           <button 
             onClick={() => navigate('/')}
             className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black transition hover:bg-slate-800 shadow-xl shadow-slate-900/20"
           >
             Return Home
           </button>
           <button 
             onClick={() => navigate('/shop')}
             className="w-full bg-slate-100 text-slate-600 rounded-2xl py-4 font-black transition hover:bg-slate-200"
           >
             Continue Shopping
           </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white text-xs">
              <Book className="w-4 h-4" />
            </span>
            Shipping & Billing
          </h2>
          <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Full Name*</label>
              <input type="text" placeholder="Your Full Name*" required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="block w-full rounded-xl bg-white border border-slate-200 p-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Address*</label>
              <input type="text" placeholder="Address*" required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="block w-full rounded-xl bg-white border border-slate-200 p-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Upazila/Thana*</label>
              <input type="text" placeholder="Upazila/Thana*" required value={address.upazila} onChange={e => setAddress({...address, upazila: e.target.value})} className="block w-full rounded-xl bg-white border border-slate-200 p-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">District*</label>
              <select 
                required 
                value={address.district} 
                onChange={e => handleDistrictChange(e.target.value)} 
                className="block w-full rounded-xl bg-white border border-slate-200 p-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm"
              >
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Mobile*</label>
              <input type="text" placeholder="Telephone*" required value={address.mobile} onChange={e => setAddress({...address, mobile: e.target.value})} className="block w-full rounded-xl bg-white border border-slate-200 p-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Email*</label>
              <input type="email" placeholder="E-Mail*" required value={address.email} onChange={e => setAddress({...address, email: e.target.value})} className="block w-full rounded-xl bg-white border border-slate-200 p-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 tracking-tight">Promo Code</h2>
          <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Enter promo code" 
               value={promoCode}
               onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
               className="flex-1 rounded-xl bg-white border border-slate-200 p-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition shadow-sm uppercase placeholder:normal-case font-bold"
               disabled={isApplyingPromo}
             />
             <button 
                type="button"
                onClick={handleApplyPromo}
                disabled={isApplyingPromo || !promoCode.trim() || promoCode.trim().toUpperCase() === appliedPromo}
                className="px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition"
             >
                {isApplyingPromo ? 'Applying...' : (appliedPromo === promoCode.trim().toUpperCase() ? 'Applied' : 'Apply')}
             </button>
          </div>
          {promoError && <p className="text-rose-500 text-sm mt-2 font-medium">{promoError}</p>}
          {appliedPromo && <p className="text-emerald-600 text-sm mt-2 font-bold">Promo code <span className="bg-emerald-100 text-emerald-800 px-1.5 rounded">{appliedPromo}</span> applied successfully!</p>}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 tracking-tight">Payment Method</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 border border-emerald-200 bg-emerald-50 rounded-2xl">
              <input 
                type="radio" 
                checked 
                readOnly
                className="h-5 w-5 text-emerald-600 border-slate-300 bg-white focus:ring-emerald-500 focus:ring-offset-white" 
              />
              <label className="ml-3 block text-sm font-bold text-emerald-900">
                Cash on Delivery
              </label>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col space-y-3">
          <div className="flex justify-between text-slate-400 text-sm">
            <span>Subtotal</span>
            <span>৳{cartTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-sm">
            <span>Delivery Fee</span>
            <span>৳{deliveryFee.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-400 text-sm font-medium">
            <span>Discount ({appliedPromo})</span>
            <span>-৳{discountAmount.toFixed(2)}</span>
          </div>
          )}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xl font-bold">
            <p>Total to Pay:</p>
            <p className="text-emerald-400">৳{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
