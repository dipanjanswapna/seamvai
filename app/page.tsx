import Image from 'next/image';
import Link from 'next/link';
import { getKitchens } from '../lib/data';
import { categories } from '../lib/constants/data';
import type { Kitchen } from '../lib/generated/prisma/client';

export default async function HomePage() {
  const dbKitchens = await getKitchens();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-[#D70F64]">Khabee</div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                📍 Select Location
              </button>
              <button className="bg-[#D70F64] text-white px-4 py-2 rounded-md hover:bg-[#B80D55] shadow-lg hover:shadow-xl transition-shadow">
                Login
              </button>
              <button className="bg-[#D70F64] text-white px-4 py-2 rounded-md hover:bg-[#B80D55] shadow-lg hover:shadow-xl transition-shadow">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full px-4">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-white text-center mb-6">
              Delicious food, delivered fast
            </h1>
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <input
                type="text"
                placeholder="Enter your delivery address"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D70F64] focus:border-[#D70F64]"
              />
              <button className="w-full mt-3 bg-[#D70F64] text-white py-3 rounded-md hover:bg-[#B80D55]">
                Find Food
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Categories</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <div key={category.id} className="shrink-0 w-20 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl text-[#D70F64]">{category.icon}</span>
              </div>
              <p className="text-sm text-gray-900 font-medium">{category.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cloud Kitchens */}
      <section className="py-8 px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Featured Cloud Kitchens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dbKitchens.map((kitchen: Kitchen) => (
            <Link key={kitchen.id} href={`/kitchen/${kitchen.id}`}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">{kitchen.logo || '🏪'}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900">{kitchen.name}</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-[#D70F64]">⭐⭐⭐⭐⭐</span>
                    <span className="ml-2 text-sm text-gray-600">4.5</span>
                  </div>
                  <p className="text-sm text-gray-600">Estimated delivery: 25-35 min</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
