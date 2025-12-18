import { getUserOrders } from '../../actions/order';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export default async function OrdersPage() {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your orders</h1>
          <Link
            href="/login"
            className="bg-[#D70F64] text-white px-6 py-3 rounded-lg hover:bg-[#B80D55] transition-colors font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const { orders } = await getUserOrders(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
              ← <span>Back to Home</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-600">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start exploring delicious food from our kitchens!</p>
            <Link
              href="/"
              className="bg-[#D70F64] text-white px-6 py-3 rounded-lg hover:bg-[#B80D55] transition-colors font-semibold"
            >
              Browse Kitchens
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.kitchen.name} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'COOKING' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </div>
                    <p className="text-lg font-bold text-[#D70F64] mt-1">
                      ৳{order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={item.menuItem.image || 'https://via.placeholder.com/40x40?text=Food'}
                            alt={item.menuItem.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-medium">{item.menuItem.name}</span>
                            <span className="text-gray-500 ml-2">× {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-[#D70F64] hover:text-[#B80D55] font-semibold text-sm"
                  >
                    View Details →
                  </Link>
                  {order.status === 'DELIVERED' && (
                    <button className="bg-[#D70F64] text-white px-4 py-2 rounded-lg hover:bg-[#B80D55] transition-colors text-sm font-semibold">
                      Order Again
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}