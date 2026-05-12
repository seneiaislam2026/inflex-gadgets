import { MessageSquare, Phone, Mail, Clock } from 'lucide-react';

export default function Support() {
  const contactInfo = [
    { icon: Phone, label: 'Call Us', value: '+880 1234-567890', desc: 'Sat - Thu, 10am - 8pm' },
    { icon: Mail, label: 'Email Us', value: 'support@inflexgadgets.com', desc: 'Responds within 24 hours' },
    { icon: MessageSquare, label: 'WhatsApp', value: '+880 1987-654321', desc: 'Quick responses' },
    { icon: Clock, label: 'Store Hours', value: '11:00 AM - 9:00 PM', desc: 'Online support 24/7' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Customer Support</h1>
        <p className="text-slate-500 text-lg">We are here to help you with your gadget needs!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contactInfo.map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-50 rounded-2xl mb-6">
              <item.icon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.label}</h3>
            <p className="text-emerald-600 font-bold text-lg mb-1">{item.value}</p>
            <p className="text-slate-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900 rounded-[3rem] p-10 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Need immediate help?</h2>
        <p className="text-slate-400 mb-8">Click the WhatsApp button to chat with our support team directly.</p>
        <a 
          href="https://wa.me/8801987654321" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
