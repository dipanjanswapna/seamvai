'use server';

import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface PlaceOrderData {
  items: OrderItem[];
  deliveryAddress?: string;
  specialInstructions?: string;
}

export async function placeOrder(data: PlaceOrderData) {
  try {
    // Get current user from Supabase
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      throw new Error('Authentication required');
    }

    const userId = session.user.id;

    if (!data.items || data.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Get the kitchen ID from the first item (assuming all items are from the same kitchen)
    const firstItem = await prisma.menuItem.findUnique({
      where: { id: data.items[0].menuItemId },
      select: { kitchenId: true },
    });

    if (!firstItem) {
      throw new Error('Invalid menu item');
    }

    const kitchenId = firstItem.kitchenId;

    // Calculate totals
    const subtotal = data.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = 50;
    const tax = subtotal * 0.05;
    const totalPrice = subtotal + deliveryFee + tax;

    // Use Prisma transaction for atomic operation
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          kitchenId,
          totalPrice,
          items: {
            create: data.items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          kitchen: true,
          user: true,
        },
      });

      // Update order count for the kitchen (optional analytics)
      await tx.kitchen.update({
        where: { id: kitchenId },
        data: {
          // You can add order count tracking here if needed
        },
      });

      return order;
    });

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/orders');
    revalidatePath(`/kitchen/${kitchenId}`);

    return {
      success: true,
      orderId: result.id,
      order: result,
    };

  } catch (error) {
    console.error('Order placement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place order',
    };
  }
}

export async function getUserOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        kitchen: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      error: 'Failed to fetch orders',
      orders: [],
    };
  }
}

export async function getKitchenOrders(kitchenId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { kitchenId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    return {
      success: false,
      error: 'Failed to fetch orders',
      orders: [],
    };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        kitchen: true,
        user: true,
      },
    });

    // Revalidate paths
    revalidatePath('/orders');
    revalidatePath(`/kitchen/${order.kitchenId}`);

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: 'Failed to update order status',
    };
  }
}