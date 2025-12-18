'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { OrderStatus } from '../generated/prisma/enums';

export interface RealtimeOrder {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  user: {
    name: string;
    phone: string;
  };
  kitchen: {
    name: string;
  };
  items: Array<{
    quantity: number;
    price: number;
    menuItem: {
      name: string;
    };
  }>;
}

export function useRealtimeOrders(kitchenId?: string) {
  const [orders, setOrders] = useState<RealtimeOrder[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial fetch
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders')
          .select(`
            id,
            status,
            totalPrice,
            createdAt,
            user:users!inner(name, phone),
            kitchen:kitchens!inner(name),
            order_items(
              quantity,
              price,
              menu_item:menu_items(name)
            )
          `)
          .order('created_at', { ascending: false });

        if (kitchenId) {
          query = query.eq('kitchen_id', kitchenId);
        }

        const { data, error } = await query.limit(20);

        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }

        // Transform the data to match our interface
        const transformedOrders: RealtimeOrder[] = (data || []).map((order: any) => ({
          id: order.id,
          status: order.status,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          user: order.user?.[0] || { name: 'Unknown', phone: 'N/A' },
          kitchen: order.kitchen?.[0] || { name: 'Unknown' },
          items: (order.order_items || []).map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            menuItem: item.menu_item?.[0] || { name: 'Unknown Item' },
          })),
        }));

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error in fetchOrders:', error);
      }
    };

    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          ...(kitchenId && { filter: `kitchen_id=eq.${kitchenId}` }),
        },
        (payload: any) => {
          console.log('Order change received:', payload);
          // Refetch orders when there's a change
          fetchOrders();
        }
      )
      .subscribe((status: string) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [kitchenId]);

  return { orders, isConnected };
}

export function useOrderStatus(orderId: string) {
  const [order, setOrder] = useState<RealtimeOrder | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            totalPrice,
            createdAt,
            user:users!inner(name, phone),
            kitchen:kitchens!inner(name),
            order_items(
              quantity,
              price,
              menu_item:menu_items(name)
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          return;
        }

        // Transform the data to match our interface
        const transformedOrder: RealtimeOrder = {
          id: data.id,
          status: data.status,
          totalPrice: data.totalPrice,
          createdAt: data.createdAt,
          user: data.user?.[0] || { name: 'Unknown', phone: 'N/A' },
          kitchen: data.kitchen?.[0] || { name: 'Unknown' },
          items: (data.order_items || []).map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            menuItem: item.menu_item?.[0] || { name: 'Unknown Item' },
          })),
        };

        setOrder(transformedOrder);
      } catch (error) {
        console.error('Error in fetchOrder:', error);
      }
    };

    fetchOrder();

    // Set up real-time subscription for this specific order
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          console.log('Order status update:', payload);
          setOrder(payload.new as RealtimeOrder);
        }
      )
      .subscribe((status: string) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { order, isConnected };
}