'use client';

import Image from 'next/image';
import { useCartStore } from '../../../../lib/store/cart';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
}

interface MenuGridProps {
  items: MenuItem[];
}

export default function MenuGrid({ items }: MenuGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
      <CheckoutBar />
    </>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-48 bg-gray-200 relative">
        <Image
          src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{item.description || 'No description'}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-[#D70F64]">৳{item.price}</span>
          <AddToCartButton item={item} />
        </div>
      </div>
    </div>
  );
}

function AddToCartButton({ item }: { item: MenuItem }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      onClick={() => addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      })}
      className="bg-[#D70F64] text-white px-6 py-3 rounded-lg hover:bg-[#B80D55] transition-colors font-semibold min-h-11 w-full sm:w-auto"
    >
      Add to Cart
    </button>
  );
}

function CheckoutBar() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{itemCount} item{itemCount > 1 ? 's' : ''}</p>
          <p className="text-lg font-bold text-gray-900">৳{total.toFixed(2)}</p>
        </div>
        <button className="bg-[#D70F64] text-white px-6 py-3 rounded-lg hover:bg-[#B80D55] transition-colors font-semibold min-h-11">
          View Cart
        </button>
      </div>
    </div>
  );
}