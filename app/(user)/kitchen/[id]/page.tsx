import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '../../../../lib/prisma';
import MenuGrid from './MenuGrid';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KitchenPage({ params }: PageProps) {
  const { id } = await params;

  const kitchen = await prisma.kitchen.findUnique({
    where: { id },
    include: { menuItems: true },
  });

  if (!kitchen) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
              ← <span>Back</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{kitchen.name}</h1>
              <p className="text-sm text-gray-600">{kitchen.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>
        <MenuGrid items={kitchen.menuItems} />
      </div>
    </div>
  );
}