import React from 'react';
import { useBannerStore } from '../../store/bannerStore.ts';
import { Upload } from 'lucide-react';

export default function AdminSettings() {
  const { 
    showBanner, isHeroEnabled, bannerText, bannerTag, heroImageUrl, heroImageUrls, logoUrl, topBannerImageUrl,
    setShowBanner, setIsHeroEnabled, setBannerText, setBannerTag, setHeroImageUrl, setHeroImageUrls, setLogoUrl, setTopBannerImageUrl
  } = useBannerStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Store Settings</h1>
      
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Branding Settings</h2>
        
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
          <div className="flex items-center gap-4 mb-4">
             {logoUrl && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                   <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                </div>
             )}
             <div className="flex-1">
               <input 
                 type="text" 
                 value={logoUrl}
                 onChange={(e) => setLogoUrl(e.target.value)}
                 className="block w-full rounded-xl bg-slate-50 border border-slate-200 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition mb-2" 
                 placeholder="e.g. https://example.com/logo.png"
               />
               <div className="relative">
                 <input 
                   type="file" 
                   accept="image/jpeg, image/png, image/webp"
                   onChange={(e) => handleImageUpload(e, setLogoUrl)}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition">
                   <Upload className="w-4 h-4" /> Upload Custom Logo (Max 2MB)
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Hero Banner Settings</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isHeroEnabled}
              onChange={(e) => setIsHeroEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        
        <div className={`max-w-2xl transition-opacity ${!isHeroEnabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <label className="block text-sm font-medium text-slate-700 mb-2">Hero Images (Add multiple for slider)</label>
          <div className="space-y-4 mb-4">
            {(heroImageUrls.length > 0 ? heroImageUrls : (heroImageUrl ? [heroImageUrl] : [''])).map((url, i, arr) => (
               <div key={i} className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={url}
                       onChange={(e) => {
                          const newUrls = [...arr];
                          newUrls[i] = e.target.value;
                          setHeroImageUrls(newUrls);
                          if (i === 0) setHeroImageUrl(e.target.value);
                       }}
                       className="flex-1 rounded-xl bg-white border border-slate-200 p-3 outline-none focus:border-emerald-500" 
                       placeholder="e.g. https://example.com/banner.jpg"
                     />
                     <button type="button" onClick={() => {
                        const newUrls = arr.filter((_, idx) => idx !== i);
                        setHeroImageUrls(newUrls);
                        if (i === 0) setHeroImageUrl(newUrls[0] || '');
                     }} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 font-bold transition">Remove</button>
                  </div>
                  <div className="relative">
                     <input 
                       type="file" 
                       accept="image/jpeg, image/png, image/webp"
                       onChange={(e) => handleImageUpload(e, (uploadedUrl) => {
                          const newUrls = [...arr];
                          newUrls[i] = uploadedUrl;
                          setHeroImageUrls(newUrls);
                          if (i === 0) setHeroImageUrl(uploadedUrl);
                       })}
                       className="absolute inset-0 w-max h-full opacity-0 cursor-pointer"
                     />
                     <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition">
                       <Upload className="w-4 h-4" /> Upload Image
                     </button>
                  </div>
                  {url && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white">
                       <img src={url} alt={`Hero Preview ${i}`} className="w-full h-32 object-cover" />
                    </div>
                  )}
               </div>
            ))}
            <button type="button" onClick={() => {
               setHeroImageUrls([...(heroImageUrls.length > 0 ? heroImageUrls : (heroImageUrl ? [heroImageUrl] : [])), '']);
            }} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition w-full">
               + Add Another Banner
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Top Promotion Banner</h2>
        
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Enable Banner</p>
              <p className="text-sm text-slate-500">Show the promotional banner at the top of the store</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showBanner}
                onChange={(e) => setShowBanner(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          
          <div className={!showBanner ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Banner Image URL</label>
                <input 
                  type="text" 
                  value={topBannerImageUrl || ''}
                  onChange={(e) => setTopBannerImageUrl(e.target.value)}
                  className="block w-full rounded-xl bg-slate-50 border border-slate-200 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition mb-4" 
                  placeholder="e.g. https://example.com/top-banner.jpg"
                />
                <div className="relative mb-4">
                   <input 
                     type="file" 
                     accept="image/jpeg, image/png, image/webp"
                     onChange={(e) => handleImageUpload(e, setTopBannerImageUrl)}
                     className="absolute inset-0 w-max h-full opacity-0 cursor-pointer"
                   />
                   <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition">
                     <Upload className="w-4 h-4" /> Upload Top Banner Image (Max 2MB)
                   </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">If an image is provided, it will replace the text banner below.</p>
                {topBannerImageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                     <img src={topBannerImageUrl} alt="Top Banner Preview" className="w-full h-16 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Banner Tag (e.g. Save 50%)</label>
                <input 
                  type="text" 
                  value={bannerTag}
                  onChange={(e) => setBannerTag(e.target.value)}
                  className="block w-full rounded-xl bg-slate-50 border border-slate-200 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition" 
                  placeholder="Leave empty to hide"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Banner Text</label>
                <input 
                  type="text" 
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="block w-full rounded-xl bg-slate-50 border border-slate-200 p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-900 transition" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
