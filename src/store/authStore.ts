import { create } from 'zustand';

interface User {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  authReady: boolean;
  setAuthReady: (ready: boolean) => void;
  setUser: (userData: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authReady: false,
  setAuthReady: (ready) => set({ authReady: ready }),
  setUser: (userData) => set({ user: userData }),
}));
