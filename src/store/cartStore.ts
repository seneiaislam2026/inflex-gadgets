import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) => {
        const cart = get().cart;
        const exists = cart.find((i) => i._id === item._id);
        if (exists) {
          set({
            cart: cart.map((i) =>
              i._id === item._id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((i) => i._id !== id) })),
      updateQuantity: (id, qty) =>
        set((state) => ({
          cart: state.cart.map((i) => (i._id === id ? { ...i, quantity: qty } : i)),
        })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
