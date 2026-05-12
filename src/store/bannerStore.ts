import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BannerState {
  showBanner: boolean;
  isHeroEnabled: boolean;
  bannerText: string;
  bannerTag: string;
  heroImageUrl: string;
  heroImageUrls: string[];
  logoUrl: string;
  topBannerImageUrl: string;
  setShowBanner: (show: boolean) => void;
  setIsHeroEnabled: (enabled: boolean) => void;
  setBannerText: (text: string) => void;
  setBannerTag: (tag: string) => void;
  setHeroImageUrl: (url: string) => void;
  setHeroImageUrls: (urls: string[]) => void;
  setLogoUrl: (url: string) => void;
  setTopBannerImageUrl: (url: string) => void;
}

export const useBannerStore = create<BannerState>()(
  persist(
    (set) => ({
      showBanner: false,
      isHeroEnabled: true,
      bannerText: 'Welcome to Inflex Gadgets! Enjoy our festival offers.',
      bannerTag: 'SPECIAL',
      heroImageUrl: '',
      heroImageUrls: [],
      logoUrl: 'https://i.ibb.co/LfwPmF9/file-00000000035c71f882f7e3e4b14ee32a.png',
      topBannerImageUrl: '',
      setShowBanner: (show) => set({ showBanner: show }),
      setIsHeroEnabled: (enabled) => set({ isHeroEnabled: enabled }),
      setBannerText: (text) => set({ bannerText: text }),
      setBannerTag: (tag) => set({ bannerTag: tag }),
      setHeroImageUrl: (url) => set({ heroImageUrl: url }),
      setHeroImageUrls: (urls) => set({ heroImageUrls: urls }),
      setLogoUrl: (url) => set({ logoUrl: url }),
      setTopBannerImageUrl: (url) => set({ topBannerImageUrl: url }),
    }),
    {
      name: 'banner-storage',
    }
  )
);
