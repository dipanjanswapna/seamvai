import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const loadFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('khabee-cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('khabee-cart', JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: loadFromStorage(),
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }
      saveToStorage(newItems);
      return { items: newItems };
    });
  },
  removeItem: (id) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      saveToStorage(newItems);
      return { items: newItems };
    });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      saveToStorage(newItems);
      return { items: newItems };
    });
  },
  clearCart: () => {
    saveToStorage([]);
    set({ items: [] });
  },
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));