import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { FileText, Download, Plus, Search, Calendar, User, CheckCircle, Clock } from 'lucide-react';

export default function AdminInvoices() {
  const [invoices] = useState<any[]>([
    { _id: '1', invoiceNumber: 'INV-1001', customerName: 'John Doe', totalAmount: 450.00, status: 'paid', issueDate: new Date().toISOString() },
    { _id: '2', invoiceNumber: 'INV-1002', customerName: 'Jane Smith', totalAmount: 120.50, status: 'draft', issueDate: new Date().toISOString() }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const handleCreate = () => {
    alert('System Note: Automated Invoice generation protocol is currently being calibrated.');
  };

  const handleDownload = (invoice: any) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 60px; font-family: 'Inter', sans-serif; color: #0f172a; max-width: 850px; margin: auto; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px;">
          <div>
            <div style="background: #059669; color: #fff; padding: 12px 20px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
               <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; font-style: italic;">Inflex</h1>
            </div>
            <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px;">Neural Logistics Depot</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Official Transmission</p>
            <h2 style="margin: 5px 0 0 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${invoice.invoiceNumber}</h2>
            <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: flex-end;">
               <span style="font-size: 10px; font-weight: 900; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">ID: ${invoice._id}</span>
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 60px; margin-bottom: 60px; padding: 30px; border: 1px dashed #e2e8f0; border-radius: 24px; background: #f8fafc;">
          <div>
            <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Customer Identity</p>
            <p style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; font-style: italic;">${invoice.customerName}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; font-weight: bold;">Verified Recipient • Logistics Node Active</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Protocol Details</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
               <div style="display: flex; justify-content: flex-end; gap: 10px;">
                  <span style="font-size: 11px; color: #64748b;">Issued:</span>
                  <span style="font-size: 12px; font-weight: 900;">${new Date(invoice.issueDate).toLocaleDateString()}</span>
               </div>
               <div style="display: flex; justify-content: flex-end; gap: 10px;">
                  <span style="font-size: 11px; color: #64748b;">Method:</span>
                  <span style="font-size: 12px; font-weight: 900; color: #059669;">Verified Payment</span>
               </div>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 60px;">
          <thead>
            <tr>
              <th style="padding: 15px 20px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #0f172a;">Description of Assets</th>
              <th style="padding: 15px 20px; text-align: right; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #0f172a;">Quantity</th>
              <th style="padding: 15px 20px; text-align: right; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #0f172a;">Total Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 25px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; italic; letter-spacing: -0.5px;">Premium Gadget Procurement & Sourcing Protocol</td>
              <td style="padding: 25px 20px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: bold; color: #64748b;">01</td>
              <td style="padding: 25px 20px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 16px; font-weight: 900; color: #0f172a;">৳${invoice.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: bold; color: #64748b;">Secured Logistics & Shipping Fee</td>
              <td style="padding: 25px 20px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: bold; color: #64748b;">—</td>
              <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: bold; color: #64748b;">Included</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="max-width: 300px;">
             <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px;">Security Note</p>
             <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #64748b; font-weight: 500;">This transmission is encrypted and verified by the Inflex Security Protocol. All transactions are final upon successful delivery node synchronization.</p>
          </div>
          <div style="text-align: right; background: #0f172a; padding: 40px; border-radius: 32px; color: #fff; min-width: 280px; box-shadow: 0 20px 40px rgba(15,23,42,0.15);">
            <p style="font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 2px;">Asset Total (BDT)</p>
            <p style="margin: 0; font-size: 44px; font-weight: 900; letter-spacing: -2px; color: #10b981;">৳${invoice.totalAmount.toLocaleString()}</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: flex-end; gap: 8px; align-items: center;">
               <div style="width: 6px; h: 6px; border-radius: 50%; background: #10b981;"></div>
               <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; color: rgba(255,255,255,0.6);">Node Synced</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 80px; border-top: 1px solid #f1f5f9; padding-top: 30px; display: flex; justify-content: space-between; align-items: center;">
           <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Inflex Gadgets • global.inflex.io • Terminal V2.4</p>
           <div style="width: 40px; h: 40px; border: 2px solid #f1f5f9; border-radius: 8px; display: flex; items-center; justify-center; opacity: 0.3;">
              <span style="font-size: 10px; font-weight: 900;">QR</span>
           </div>
        </div>
      </div>
    `;
    
    html2pdf().from(element).set({
      margin: 10,
      filename: `Invoice-${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Accounting Terminal</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Invoice Manager</h1>
        </div>
        <button 
          onClick={handleCreate} 
          className="w-full md:w-auto bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] font-black hover:bg-emerald-600 transition shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs italic"
        >
          <Plus className="w-4 h-4" /> Generate Invoice
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
               type="text" 
               placeholder="Search by Invoice ID or Client..."
               className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 outline-none transition shadow-sm"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden backdrop-blur-sm">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Transferred</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <FileText className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                       <span className="text-sm font-black text-slate-900">{inv.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">{inv.customerName}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-emerald-600 font-black tracking-tight">৳{inv.totalAmount.toFixed(2)}</td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className={`px-3 py-1 inline-flex text-[9px] font-black rounded-lg uppercase tracking-widest ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.status === 'paid' ? <CheckCircle className="w-3 h-3 mr-1.5" /> : <Clock className="w-3 h-3 mr-1.5" />}
                      {inv.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDownload(inv)} 
                      className="inline-flex items-center gap-2 text-[10px] font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all uppercase tracking-widest italic"
                    >
                      <Download className="w-3 h-3" /> Transmit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
           {invoices.map((inv) => (
             <div key={inv._id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                        <FileText className="w-4 h-4" />
                     </div>
                     <div>
                        <h3 className="text-xs font-black text-slate-900 tracking-tight">{inv.invoiceNumber}</h3>
                        <p className="text-[9px] font-bold text-slate-400">{new Date(inv.issueDate).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                    inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </div>
               </div>
               
               <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                     <User className="w-3.5 h-3.5 text-slate-400" />
                     <span className="text-xs font-black text-slate-700 uppercase tracking-tight italic">{inv.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar className="w-3.5 h-3.5 text-slate-400" />
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transmission Protocol Active</span>
                  </div>
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Asset Value</p>
                     <p className="text-lg font-black text-emerald-600 tracking-tighter">৳{inv.totalAmount.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => handleDownload(inv)}
                    className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                  >
                     <Download className="w-4 h-4" />
                  </button>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

