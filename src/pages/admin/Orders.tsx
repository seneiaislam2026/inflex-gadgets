import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase.ts';
import { ShoppingCart, Clock, CheckCircle, Package, Search, Plus, Facebook, Globe, User, XCircle, Book, Trash2, Copy, Truck, ShieldAlert, ShieldCheck, Mail, MessageSquare, Phone } from 'lucide-react';

enum OperationType {
  UPDATE = 'update',
  GET = 'get',
  CREATE = 'create',
  DELETE = 'delete',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('active');

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    returned: orders.filter(o => o.status === 'returned').length
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyingId(text);
    setTimeout(() => setCopyingId(null), 2000);
  };
  
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    address: '',
    district: 'Dhaka',
    source: 'facebook',
    items: [] as any[],
  });

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Automated Spam Detection
        let isLikelySpam = false;
        const phone = data.deliveryAddress?.mobile || data.deliveryAddress?.phone || '';
        const name = data.deliveryAddress?.fullName || '';
        const district = data.deliveryAddress?.district || '';
        
        if (phone.length > 0 && !/^(01)[3-9][0-9]{8}$/.test(phone)) isLikelySpam = true;
        if (name.length < 3) isLikelySpam = true;
        if (data.total < 100) isLikelySpam = true; // Unusually low order

        return {
          _id: doc.id,
          ...data,
          isLikelySpam: isLikelySpam && data.status !== 'returned'
        };
      });
      setOrders(dbOrders);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    const fetchProducts = async () => {
      try {
        const pSnap = await getDocs(collection(db, 'products'));
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'products');
      }
    };
    fetchProducts();

    return () => unsubscribe();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrder.source === 'facebook' && (!newOrder.customerName || !newOrder.phone)) {
      alert("Please fill in customer details for Facebook orders.");
      return;
    }
    if (newOrder.items.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    setLoading(true);
    try {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let shortId = '';
      for (let i = 0; i < 6; i++) {
          shortId += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const deliveryFee = newOrder.source === 'physical' ? 0 : (newOrder.district === 'Dhaka' ? 60 : 100);
      const subtotal = newOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      const orderPath = `orders/${shortId}`;
      await setDoc(doc(db, 'orders', shortId), {
        status: 'pending',
        userId: auth.currentUser?.uid || 'admin_manual_entry',
        items: newOrder.items,
        total: subtotal + deliveryFee,
        deliveryFee,
        source: newOrder.source,
        deliveryAddress: {
          fullName: newOrder.customerName,
          street: newOrder.address,
          district: newOrder.district,
          mobile: newOrder.phone,
          email: ''
        },
        paymentMethod: 'Manual Entry',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setShowCreateModal(false);
      setNewOrder({ customerName: '', phone: '', address: '', district: 'Dhaka', source: 'facebook', items: [] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrder = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Order ${order._id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .label { border: 2px solid #000; padding: 30px; border-radius: 20px; max-width: 500px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-weight: 900; font-size: 24px; text-transform: uppercase; font-style: italic; }
            .order-id { font-weight: 900; font-size: 18px; }
            .section-title { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .customer-name { font-weight: 900; font-size: 20px; margin: 0; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 30px; }
            .item-list { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .item-list th { text-align: left; font-size: 10px; border-bottom: 1px solid #e2e8f0; padding: 8px 0; }
            .item-list td { padding: 10px 0; font-size: 12px; font-weight: bold; border-bottom: 1px solid #f1f5f9; }
            .footer { margin-top: 30px; text-align: center; border-top: 2px dashed #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; font-weight: bold; text-transform: uppercase; }
            @media print { body { padding: 0; } .label { border: 1px solid #000; max-width: 100%; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <div class="logo">INFLEX</div>
              <div class="order-id">#${order._id.toUpperCase()}</div>
            </div>
            
            <div class="info-grid">
              <div>
                <div class="section-title">Recipient Information</div>
                <p class="customer-name">${order.deliveryAddress?.fullName || 'N/A'}</p>
                <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">${order.deliveryAddress?.mobile || order.deliveryAddress?.phone || 'N/A'}</p>
                <p style="margin: 5px 0; font-size: 12px; line-height: 1.4;">${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.district || ''}</p>
              </div>
            </div>

            <div class="section-title">Asset Inventory</div>
            <table class="item-list">
              <thead>
                <tr>
                  <th>Product Description</th>
                  <th style="text-align: right;">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item: any) => `
                  <tr>
                    <td>${item.name}</td>
                    <td style="text-align: right;">${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
               <div>
                  <div class="section-title">Logistics Status</div>
                  <div style="font-size: 12px; font-weight: 900; color: #059669; text-transform: uppercase;">${order.status}</div>
               </div>
               <div style="text-align: right;">
                  <div class="section-title">Total Value</div>
                  <div style="font-size: 24px; font-weight: 900;">৳${order.total.toLocaleString()}</div>
               </div>
            </div>

            <div class="footer">
              Synchronized Transmission • Inflex Gadgets Protocol • ${orderDate.toLocaleDateString()}
            </div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleNotifyCustomer = (order: any, method: 'email' | 'sms') => {
    const name = order.deliveryAddress?.fullName || 'Valued Customer';
    const phone = order.deliveryAddress?.mobile || order.deliveryAddress?.phone || '';
    const email = order.deliveryAddress?.email || '';
    const status = order.status.toUpperCase();
    const orderId = order._id.toUpperCase();
    const total = order.total.toLocaleString();
    
    const templates = {
      PENDING: {
        subject: `[INFLEX] Order Received: #${orderId} - Processing Initialized`,
        body: `DEAR ${name.toUpperCase()},\n\nSYSTEM UPDATE: Order #${orderId} of ৳${total} has been successfully logged into our network.\n\n------------------------------------------------\nCURRENT STATUS: PENDING VERIFICATION\n------------------------------------------------\n\nOur logistics team is currently authenticating your assets. You will receive further transmissions once the status node shifts to processing.\n\nLIVE TRANSMISSION LINK:\nhttps://inflex-gadgets.web.app/profile\n\nThank you for choosing Inflex Gadgets.\n\nRegards,\nOPERATIONAL COMMAND, INFLEX\nAutomated System Node v2.0`
      },
      PROCESSING: {
        subject: `[INFLEX] Active Status: #${orderId} - Asset Verification`,
        body: `HELLO ${name.toUpperCase()},\n\nLOGISTICS REPORT: Order #${orderId} is now ACTIVE and undergoing asset integrity checks at our distribution terminal.\n\n------------------------------------------------\nCURRENT STATUS: PROCESSING / PACKING\n------------------------------------------------\n\nYour deployment is scheduled. Check the live feed for real-time adjustments.\n\nTRACKING LINK:\nhttps://inflex-gadgets.web.app/profile\n\nBest regards,\nLOGISTICS DIVISION, INFLEX`
      },
      SHIPPED: {
        subject: `[INFLEX] Deployment Initialized: #${orderId} - Assets In Transit`,
        body: `ALERT ${name.toUpperCase()},\n\nOrder #${orderId} has been DISPATCHED from Inflex Terminal 01. Your assets are now in transit to your deployment zone.\n\n------------------------------------------------\nCURRENT STATUS: SHIPPED / IN TRANSIT\n------------------------------------------------\n\nPrepare for arrival. Use the link below to monitor intercept coordinates.\n\nINTERCEPT STATUS:\nhttps://inflex-gadgets.web.app/profile\n\nInflex Operational Team`
      },
      DELIVERED: {
        subject: `[INFLEX] Mission Success: #${orderId} - Assets Secured`,
        body: `MISSION COMPLETE ${name.toUpperCase()},\n\nOur scanners confirm that Order #${orderId} has reached its destination. Your secure gadgets are now in your possession.\n\n------------------------------------------------\nFINAL STATUS: DELIVERED / SECURED\n------------------------------------------------\n\nWe trust the equipment exceeds performance benchmarks. Rate your experience via the portal.\n\nPORTAL ACCESS:\nhttps://inflex-gadgets.web.app/profile\n\nWelcome to the future.\n- TEAM INFLEX`
      },
      CANCELLED: {
        subject: `[INFLEX] Order Cancelled: #${orderId}`,
        body: `NOTICE ${name.toUpperCase()},\n\nOrder #${orderId} has been CANCELLED as per your request or system protocol.\n\n------------------------------------------------\nSTATUS: CANCELLED\n------------------------------------------------\n\nIf this was unintentional, contact our support terminal immediately.\n\nDETAIL NODE:\nhttps://inflex-gadgets.web.app/profile`
      }
    };

    const template = templates[status as keyof typeof templates] || {
      subject: `Order Update: #${orderId}`,
      body: `Hi ${name}, your order #${orderId} status has been updated to ${status}.\n\nView details: https://inflex-gadgets.web.app/profile`
    };
    
    if (method === 'email') {
      if (!email) {
        alert('No email record found for this transmission.');
        return;
      }
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
    } else {
      if (!phone) {
        alert('No contact number found for this transmission.');
        return;
      }
      const smsBody = `Inflex Update: #${orderId} is ${status}. Track at: https://inflex-gadgets.web.app/profile. Thank you!`;
      window.location.href = `sms:${phone}?body=${encodeURIComponent(smsBody)}`;
    }
  };

  const handlePrintAllActive = () => {
    const activeOrders = orders.filter(o => o.status === 'confirmed');
    if (activeOrders.length === 0) {
      alert('No confirmed deployments found in current sector.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Batch Order Report • Inflex</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; }
            th { bg-slate-50; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-weight: 900; font-size: 24px; color: #059669; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">INFLEX GADGETS</div>
            <p>Confirmed Orders Batch Report - ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL No</th>
                <th>Customer Name</th>
                <th>Number</th>
                <th>Order ID</th>
                <th>Product Details</th>
              </tr>
            </thead>
            <tbody>
              ${activeOrders.map((order, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td style="font-weight: bold;">${order.deliveryAddress?.fullName || 'N/A'}</td>
                  <td>${order.deliveryAddress?.mobile || order.deliveryAddress?.phone || 'N/A'}</td>
                  <td>#${order._id.toUpperCase()}</td>
                  <td>
                    ${order.items.map((item: any) => `${item.name} (${item.quantity})`).join('<br/>')}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const addItemToOrder = (product: any) => {
    const existing = newOrder.items.find(i => i.productId === product.id);
    if (existing) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { 
          productId: product.id, 
          name: product.name, 
          price: product.discountPrice || product.price, 
          quantity: 1, 
          image: product.images?.[0] || '' 
        }]
      });
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status, 
        updatedAt: new Date() 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${orderId}`);
    }
  };



  const updateDeliveryDate = async (orderId: string, date: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        customDeliveryDate: date,
        updatedAt: new Date() 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !['delivered', 'cancelled', 'returned'].includes(order.status);
    return order.status === statusFilter;
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
            <ShoppingCart className="w-8 h-8 text-emerald-600" />
            Order Management
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Manage and process customer orders</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
             onClick={handlePrintAllActive}
             className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
           >
              <Book className="w-4 h-4" /> Batch Print Active
           </button>
           <button 
             onClick={() => setShowCreateModal(true)}
             className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
           >
              <Plus className="w-4 h-4" /> Create New Order
           </button>
        </div>
      </div>

      {/* Live Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <button 
          onClick={() => setStatusFilter('active')}
          className={`p-5 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${statusFilter === 'active' ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20' : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${statusFilter === 'active' ? 'bg-white/10' : 'bg-slate-100'}`}>
            <Package className={`w-5 h-5 ${statusFilter === 'active' ? 'text-white' : 'text-slate-600'}`} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${statusFilter === 'active' ? 'text-slate-400' : 'text-slate-400'}`}>Active</p>
            <p className={`text-xl font-black leading-none mt-1 ${statusFilter === 'active' ? 'text-white' : 'text-slate-900'}`}>
              {stats.pending + stats.processing + stats.shipped}
            </p>
          </div>
        </button>

        <button 
          onClick={() => setStatusFilter('pending')}
          className={`p-5 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${statusFilter === 'pending' ? 'bg-amber-600 border-amber-600 shadow-xl shadow-amber-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-amber-300'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${statusFilter === 'pending' ? 'bg-white/10' : 'bg-amber-100'}`}>
            <Clock className={`w-5 h-5 ${statusFilter === 'pending' ? 'text-white' : 'text-amber-600'}`} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${statusFilter === 'pending' ? 'text-amber-200' : 'text-slate-400'}`}>Pending</p>
            <p className={`text-xl font-black leading-none mt-1 ${statusFilter === 'pending' ? 'text-white' : 'text-slate-900'}`}>{stats.pending}</p>
          </div>
        </button>

        <button 
          onClick={() => setStatusFilter('processing')}
          className={`p-5 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${statusFilter === 'processing' ? 'bg-sky-600 border-sky-600 shadow-xl shadow-sky-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-sky-300'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${statusFilter === 'processing' ? 'bg-white/10' : 'bg-sky-100'}`}>
            <ShoppingCart className={`w-5 h-5 ${statusFilter === 'processing' ? 'text-white' : 'text-sky-600'}`} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${statusFilter === 'processing' ? 'text-sky-200' : 'text-slate-400'}`}>Process</p>
            <p className={`text-xl font-black leading-none mt-1 ${statusFilter === 'processing' ? 'text-white' : 'text-slate-900'}`}>{stats.processing}</p>
          </div>
        </button>

        <button 
          onClick={() => setStatusFilter('shipped')}
          className={`p-5 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${statusFilter === 'shipped' ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-300'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${statusFilter === 'shipped' ? 'bg-white/10' : 'bg-indigo-100'}`}>
            <Truck className={`w-5 h-5 ${statusFilter === 'shipped' ? 'text-white' : 'text-indigo-600'}`} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${statusFilter === 'shipped' ? 'text-indigo-200' : 'text-slate-400'}`}>Shipped</p>
            <p className={`text-xl font-black leading-none mt-1 ${statusFilter === 'shipped' ? 'text-white' : 'text-slate-900'}`}>{stats.shipped}</p>
          </div>
        </button>

        <button 
          onClick={() => setStatusFilter('delivered')}
          className={`p-5 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${statusFilter === 'delivered' ? 'bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-600/20' : 'bg-white border-slate-100 shadow-sm hover:border-emerald-300'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${statusFilter === 'delivered' ? 'bg-white/10' : 'bg-emerald-100'}`}>
            <CheckCircle className={`w-5 h-5 ${statusFilter === 'delivered' ? 'text-white' : 'text-emerald-600'}`} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${statusFilter === 'delivered' ? 'text-emerald-200' : 'text-slate-400'}`}>Delivered</p>
            <p className={`text-xl font-black leading-none mt-1 ${statusFilter === 'delivered' ? 'text-white' : 'text-slate-900'}`}>{stats.delivered}</p>
          </div>
        </button>

        <button 
          onClick={() => setStatusFilter('returned')}
          className={`p-5 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${statusFilter === 'returned' ? 'bg-rose-600 border-rose-600 shadow-xl shadow-rose-600/20' : 'bg-rose-50 border-rose-100 shadow-sm hover:border-rose-400'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${statusFilter === 'returned' ? 'bg-white/10' : 'bg-rose-100'}`}>
            <XCircle className={`w-5 h-5 ${statusFilter === 'returned' ? 'text-white' : 'text-rose-600'}`} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${statusFilter === 'returned' ? 'text-rose-200' : 'text-rose-400'}`}>Returned</p>
            <p className={`text-xl font-black leading-none mt-1 ${statusFilter === 'returned' ? 'text-white' : 'text-rose-600'}`}>{stats.returned}</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden backdrop-blur-sm">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Delivery</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => {
                const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
                const estDays = order.deliveryAddress?.district === 'Dhaka' ? 3 : 5;
                const estDate = new Date(orderDate);
                estDate.setDate(estDate.getDate() + estDays);

                return (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <div className="text-sm font-black text-slate-900">#{order._id.toUpperCase()}</div>
                         <button 
                           onClick={() => copyToClipboard(order._id)}
                           className={`p-1.5 rounded-lg transition-all ${copyingId === order._id ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 hover:bg-slate-100'}`}
                         >
                            {copyingId === order._id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                         </button>
                         {order.isLikelySpam && (
                            <span className="bg-amber-500 p-1 rounded-full shadow-sm shadow-amber-500/40" title="Possible Spam Detected">
                               <ShieldAlert className="w-3 h-3 text-white" />
                            </span>
                         )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {orderDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{order.deliveryAddress?.fullName || `${order.deliveryAddress?.firstName} ${order.deliveryAddress?.lastName}`}</div>
                      <div className="text-[10px] text-slate-500">{order.deliveryAddress?.district}, {order.deliveryAddress?.mobile || order.deliveryAddress?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 ring-1 ring-slate-200 bg-white px-2 py-0.5 rounded-full w-fit">
                        {order.source === 'facebook' ? (
                          <><Facebook className="w-3 h-3 text-blue-600" /> <span className="text-[10px] font-bold text-blue-600 uppercase">Facebook</span></>
                        ) : order.source === 'manual' ? (
                          <><User className="w-3 h-3 text-slate-600" /> <span className="text-[10px] font-bold text-slate-600 uppercase">Manual</span></>
                        ) : (
                          <><Globe className="w-3 h-3 text-emerald-600" /> <span className="text-[10px] font-bold text-emerald-600 uppercase">Website</span></>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-bold">৳{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1 max-w-[150px] overflow-hidden">
                         {order.items?.map((item: any, i: number) => (
                           <div key={i} className="text-[10px] font-bold text-slate-700 truncate bg-slate-100 px-2 py-1 rounded-md" title={`${item.name} (x${item.quantity})`}>
                             {item.quantity}x {item.name}
                           </div>
                         ))}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <input 
                         type="date"
                         value={order.customDeliveryDate || (estDate.toISOString().split('T')[0])}
                         onChange={(e) => updateDeliveryDate(order._id, e.target.value)}
                         className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 border-none rounded-lg p-1 outline-none ring-1 ring-indigo-100 focus:ring-indigo-300 w-28"
                       />
                       <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Status: {order.customDeliveryDate ? 'Manual' : 'Auto'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 mb-2">
                       <button 
                         onClick={() => updateStatus(order._id, 'pending')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'pending' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-100 text-slate-400 hover:bg-amber-50'}`}
                       >
                         {order.status === 'pending' && <CheckCircle className="w-3 h-3" />} Pending
                       </button>
                       <button 
                         onClick={() => updateStatus(order._id, 'confirmed')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'confirmed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50'}`}
                       >
                         {order.status === 'confirmed' && <CheckCircle className="w-3 h-3" />} Confirm Order
                       </button>
                       <button 
                         onClick={() => updateStatus(order._id, 'processing')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'processing' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-100 text-slate-400 hover:bg-sky-50'}`}
                       >
                         {order.status === 'processing' && <CheckCircle className="w-3 h-3" />} Process
                       </button>
                       <button 
                         onClick={() => updateStatus(order._id, 'shipped')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'shipped' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50'}`}
                       >
                         {order.status === 'shipped' && <CheckCircle className="w-3 h-3" />} Shipped
                       </button>
                       <button 
                         onClick={() => updateStatus(order._id, 'delivered')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'delivered' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50'}`}
                       >
                         {order.status === 'delivered' && <CheckCircle className="w-3 h-3" />} Delivered
                       </button>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => updateStatus(order._id, 'cancelled')}
                         className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'cancelled' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-slate-100 text-slate-400 hover:bg-rose-50'}`}
                       >
                         Cancel
                       </button>
                       <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                       <button 
                         onClick={() => handlePrintOrder(order)}
                         className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition"
                         title="Print Label"
                       >
                         <Book className="w-3.5 h-3.5" /> Print
                       </button>
                       <button 
                         onClick={() => updateStatus(order._id, 'returned')}
                         className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${order.status === 'returned' ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-200' : 'text-slate-400 hover:bg-slate-100'}`}
                         title={order.status === 'returned' ? "Returned" : "Mark as Returned"}
                       >
                          <XCircle className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={async () => {
                           if (confirm('Cancel this order?')) {
                             try {
                               await updateDoc(doc(db, 'orders', order._id), { status: 'cancelled', updatedAt: new Date() });
                             } catch (e) {
                               handleFirestoreError(e, OperationType.DELETE, `orders/${order._id}`);
                             }
                           }
                         }}
                         className="p-1 px-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleNotifyCustomer(order, 'email')}
                         className="p-1 px-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                       >
                         <Mail className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredOrders.map((order) => {
            const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
            const estDays = order.deliveryAddress?.district === 'Dhaka' ? 3 : 5;
            const estDate = new Date(orderDate);
            estDate.setDate(estDate.getDate() + estDays);

            return (
              <div key={order._id} className="p-5 border-b border-slate-100 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <div className="text-sm font-black text-slate-900">#{order._id.toUpperCase()}</div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full">
                           {order.source === 'facebook' ? <Facebook className="w-2.5 h-2.5 text-blue-600" /> : order.source === 'manual' ? <User className="w-2.5 h-2.5 text-slate-500" /> : <Globe className="w-2.5 h-2.5 text-emerald-600" />}
                           <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{order.source}</span>
                        </div>
                        {order.status === 'returned' && (
                          <span className="bg-rose-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Returned</span>
                        )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">
                      {orderDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-emerald-600 tabular-nums">৳{order.total.toLocaleString()}</div>
                    <div className="mt-1">
                      <input 
                         type="date"
                         value={order.customDeliveryDate || (estDate.toISOString().split('T')[0])}
                         onChange={(e) => updateDeliveryDate(order._id, e.target.value)}
                         className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 rounded-lg p-1 outline-none w-24 text-center"
                      />
                    </div>
                  </div>
                </div>
              
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50 relative overflow-hidden">
                 <div className="flex justify-between items-center mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                       <User className="w-3 h-3 text-slate-400 shrink-0" />
                       <div className="text-[11px] font-black text-slate-900 uppercase italic truncate leading-none">
                         {order.deliveryAddress?.fullName || `${order.deliveryAddress?.firstName} ${order.deliveryAddress?.lastName}`}
                       </div>
                    </div>
                    <button 
                       onClick={() => handlePrintOrder(order)}
                       className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition shrink-0"
                    >
                       <Book className="w-3 h-3" /> <span className="hidden sm:inline">Print Label</span>
                    </button>
                 </div>
                 <div className="flex items-start gap-2">
                    <Truck className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-[10px] font-bold text-slate-500 leading-tight min-w-0 flex-1">
                       <span className="text-indigo-600 font-black">{order.deliveryAddress?.district}</span> • {order.deliveryAddress?.mobile || order.deliveryAddress?.phone}
                       <p className="mt-0.5 truncate opacity-70 break-words">{order.deliveryAddress?.street}</p>
                    </div>
                 </div>

                 {/* Mobile Product Items */}
                 <div className="mt-2 mb-3 bg-white/50 p-2 rounded-xl border border-slate-100 flex flex-col gap-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 shadow-sm">Ordered Items</p>
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                         <span className="text-slate-700 truncate mr-2" title={item.name}>• {item.name}</span>
                         <span className="text-emerald-600 whitespace-nowrap bg-emerald-50 px-1.5 py-0.5 rounded-md">x{item.quantity}</span>
                      </div>
                    ))}
                 </div>

               <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                     <button 
                       onClick={() => updateStatus(order._id, 'pending')}
                       className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'pending' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-100 text-slate-400 active:scale-95'}`}
                     >
                       {order.status === 'pending' && <CheckCircle className="w-3.5 h-3.5" />} Pending
                     </button>
                     <button 
                       onClick={() => updateStatus(order._id, 'confirmed')}
                       className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'confirmed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 text-slate-400 active:scale-95'}`}
                     >
                       {order.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5" />} Confirm
                     </button>
                     <button 
                       onClick={() => updateStatus(order._id, 'processing')}
                       className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'processing' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-100 text-slate-400 active:scale-95'}`}
                     >
                       {order.status === 'processing' && <CheckCircle className="w-3.5 h-3.5" />} Process
                     </button>
                     <button 
                       onClick={() => updateStatus(order._id, 'shipped')}
                       className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${order.status === 'shipped' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 text-slate-400 active:scale-95'}`}
                     >
                       {order.status === 'shipped' && <CheckCircle className="w-3.5 h-3.5" />} Shipped
                     </button>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-1">
                    <button 
                       onClick={() => updateStatus(order._id, 'delivered')}
                       className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm flex items-center justify-center gap-2 ${order.status === 'delivered' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-[0.98]'}`}
                     >
                       {order.status === 'delivered' && <CheckCircle className="w-4 h-4" />} Delivered Order
                    </button>
                    
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-[1.8rem] border border-slate-100/80">
                       <button 
                         onClick={() => handlePrintOrder(order)}
                         className="flex-1 flex items-center justify-center py-4 bg-white text-slate-600 rounded-2xl shadow-sm active:scale-95 transition border border-slate-200/50"
                         title="Print Label"
                       >
                         <Book className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={() => handleNotifyCustomer(order, 'email')}
                         className="flex-1 flex items-center justify-center py-4 bg-indigo-50 text-indigo-600 rounded-2xl active:scale-95 transition border border-indigo-100/50"
                         title="Email Update"
                       >
                         <Mail className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={() => handleNotifyCustomer(order, 'sms')}
                         className="flex-1 flex items-center justify-center py-4 bg-emerald-50 text-emerald-600 rounded-2xl active:scale-95 transition border border-emerald-100/50"
                         title="WhatsApp/SMS"
                       >
                         <MessageSquare className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={async () => {
                           if (confirm('Cancel this order?')) {
                             try {
                               await updateDoc(doc(db, 'orders', order._id), { status: 'cancelled', updatedAt: new Date() });
                             } catch (e) {
                               handleFirestoreError(e, OperationType.UPDATE, `orders/${order._id}`);
                             }
                           }
                         }}
                         className="flex-1 flex items-center justify-center py-4 bg-rose-50 text-rose-500 rounded-2xl active:scale-95 transition border border-rose-100/50"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
               </div>
              </div>
            </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium">No {statusFilter} orders found.</div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 backdrop-blur-sm sm:overflow-y-auto">
          <div className="bg-white h-[95vh] md:h-auto md:min-h-0 rounded-t-[2rem] md:rounded-[2.5rem] w-full max-w-5xl shadow-2xl flex flex-col md:flex-row md:max-h-[90vh] overflow-hidden">
            
            {/* Modal Header for Mobile */}
            <div className="md:hidden flex items-center shadow-sm justify-between p-4 border-b bg-white z-20 flex-shrink-0">
               <h2 className="font-black italic">CREATE ORDER</h2>
               <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-100 rounded-full">
                  <Plus className="w-5 h-5 rotate-45" />
               </button>
            </div>

            {/* Left: Customer Info */}
            <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 hidden md:block md:!block" id="mobile-customer-info">
               <div className="hidden md:block">
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                       <Plus className="w-6 h-6 text-emerald-600" />
                    </div>
                    Manual Order Entry
                  </h2>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Order Source*</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                         type="button"
                         onClick={() => setNewOrder({...newOrder, source: 'facebook'})}
                         className={`py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${newOrder.source === 'facebook' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                       >
                          <Facebook className="w-4 h-4" /> Facebook
                       </button>
                       <button 
                         type="button"
                         onClick={() => setNewOrder({...newOrder, source: 'physical'})}
                         className={`py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${newOrder.source === 'physical' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                       >
                          <User className="w-4 h-4" /> Physical
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Customer Name</label>
                        <input type="text" value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-medium text-sm" placeholder="e.g. Rahat Islam" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Phone Number</label>
                        <input type="text" value={newOrder.phone} onChange={e => setNewOrder({...newOrder, phone: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-medium text-sm" placeholder="017xxxxxxxx" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">District</label>
                        <select value={newOrder.district} onChange={e => setNewOrder({...newOrder, district: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-bold text-sm">
                           <option value="Dhaka">Dhaka (৳60)</option>
                           <option value="Outside Dhaka">Outside Dhaka (৳100)</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Address</label>
                        <textarea value={newOrder.address} onChange={e => setNewOrder({...newOrder, address: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-medium text-sm" rows={2} placeholder="Full delivery address"></textarea>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Product Selection & Mobile Layout Adjustments */}
            <div className="w-full md:w-[450px] flex flex-col md:h-full bg-slate-50/50 flex-1 md:flex-none">
               
               {/* This inner div acts as the scrolling container for both customer info and products on mobile. On desktop it only scrolls products. */}
               <div className="flex-1 overflow-y-auto flex flex-col">
                  
                  {/* MOBILE CUSTOMER INFO (Moved here visually on mobile) */}
                  <div className="md:hidden p-6 space-y-6 border-b border-slate-100 bg-white">
                     <div className="space-y-6">
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Order Source*</label>
                          <div className="grid grid-cols-2 gap-2">
                             <button 
                               type="button"
                               onClick={() => setNewOrder({...newOrder, source: 'facebook'})}
                               className={`py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${newOrder.source === 'facebook' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                             >
                                <Facebook className="w-4 h-4" /> Facebook
                             </button>
                             <button 
                               type="button"
                               onClick={() => setNewOrder({...newOrder, source: 'physical'})}
                               className={`py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition ${newOrder.source === 'physical' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                             >
                                <User className="w-4 h-4" /> Physical
                             </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Customer Name</label>
                              <input type="text" value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-medium text-sm" placeholder="e.g. Rahat Islam" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Phone Number</label>
                              <input type="text" value={newOrder.phone} onChange={e => setNewOrder({...newOrder, phone: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-medium text-sm" placeholder="017xxxxxxxx" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">District</label>
                              <select value={newOrder.district} onChange={e => setNewOrder({...newOrder, district: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-bold text-sm">
                                 <option value="Dhaka">Dhaka (৳60)</option>
                                 <option value="Outside Dhaka">Outside Dhaka (৳100)</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Address</label>
                              <textarea value={newOrder.address} onChange={e => setNewOrder({...newOrder, address: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-medium text-sm" rows={2} placeholder="Full delivery address"></textarea>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Product Details Section */}
                  <div className="p-6 md:p-8 space-y-4 flex-1">
                     <div className="sticky top-0 bg-slate-50/90 md:bg-slate-50/90 backdrop-blur-md p-1 rounded-2xl z-10 -mx-2 px-2 pb-2 mt-[-8px]">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input 
                             type="text" 
                             placeholder="Search products..." 
                             className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 shadow-sm" 
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-2">
                        {filteredProducts.slice(0, 10).map(p => (
                           <button 
                             key={p.id}
                             type="button"
                             onClick={() => addItemToOrder(p)}
                             className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 transition text-left group shadow-sm w-full"
                           >
                              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {p.images?.[0] ? (
                                  <img src={p.images[0]} className="w-full h-full object-cover" alt={p.name} />
                                ) : (
                                  <Package className="w-6 h-6 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[11px] font-black text-slate-900 group-hover:text-emerald-600 truncate">{p.name}</p>
                                 <p className="text-[10px] font-bold text-emerald-600 mt-0.5">৳{p.discountPrice || p.price}</p>
                              </div>
                              <Plus className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:scale-110 transition-transform" />
                           </button>
                        ))}
                     </div>

                     {newOrder.items.length > 0 && (
                       <div className="mt-8 pb-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Cart Items ({newOrder.items.length})</label>
                          <div className="space-y-2">
                             {newOrder.items.map(item => (
                                <div key={item.productId} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm w-full">
                                   <div className="flex-1 min-w-0">
                                      <p className="text-xs font-black text-slate-900 truncate pr-2">{item.name}</p>
                                      <p className="text-[10px] text-slate-500 mt-1">
                                         {item.quantity} x <span className="font-bold text-emerald-600">৳{item.price}</span>
                                      </p>
                                   </div>
                                   <button 
                                     type="button"
                                     onClick={() => setNewOrder({...newOrder, items: newOrder.items.filter(i => i.productId !== item.productId)})}
                                     className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition flex-shrink-0"
                                   >
                                      <XCircle className="w-4 h-4" />
                                   </button>
                                </div>
                             ))}
                          </div>
                       </div>
                     )}
                  </div>
               </div>

               {/* Right side Footer */}
               <div className="bg-slate-900 text-white p-4 md:p-8 space-y-3 md:rounded-tl-[2.5rem] flex-shrink-0 w-full z-20">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
                     <span>Subtotal</span>
                     <span>৳{newOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
                     <span>Delivery ({newOrder.source === 'physical' ? 'Physical' : newOrder.district})</span>
                     <span>৳{newOrder.source === 'physical' ? 0 : (newOrder.district === 'Dhaka' ? 60 : 100)}</span>
                  </div>
                  <div className="flex justify-between text-lg md:text-xl font-black pt-2 border-t border-white/10">
                     <span className="italic">TOTAL</span>
                     <span className="text-emerald-400">৳{(newOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) + (newOrder.source === 'physical' ? 0 : (newOrder.district === 'Dhaka' ? 60 : 100))).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 md:gap-3 pt-2">
                     <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 md:py-4 text-slate-400 font-bold hover:text-white transition text-xs md:text-sm">Cancel</button>
                     <button type="button" onClick={handleCreateOrder} disabled={loading} className="flex-[2] py-3 md:py-4 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black shadow-xl shadow-emerald-600/40 hover:bg-emerald-500 transition disabled:opacity-50 text-xs md:text-sm">Confirm Order</button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
