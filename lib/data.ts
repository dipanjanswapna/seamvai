import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cached function to get all kitchens
export const getKitchens = unstable_cache(
  async () => {
    try {
      const kitchens = await prisma.kitchen.findMany({
        include: {
          _count: {
            select: {
              menuItems: true,
              orders: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return kitchens;
    } catch (error) {
      console.error('Error fetching kitchens:', error);
      return [];
    }
  },
  ['kitchens'],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ['kitchens'],
  }
);

// Cached function to get a specific kitchen with menu items
export const getKitchenWithMenu = unstable_cache(
  async (kitchenId: string) => {
    try {
      const kitchen = await prisma.kitchen.findUnique({
        where: { id: kitchenId },
        include: {
          menuItems: {
            orderBy: {
              name: 'asc',
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      return kitchen;
    } catch (error) {
      console.error('Error fetching kitchen with menu:', error);
      return null;
    }
  },
  ['kitchen-menu'],
  {
    revalidate: 180, // Cache for 3 minutes
    tags: ['kitchen-menu'],
  }
);

// Cached function to get menu items for a kitchen
export const getMenuItems = unstable_cache(
  async (kitchenId: string) => {
    try {
      const menuItems = await prisma.menuItem.findMany({
        where: { kitchenId },
        orderBy: {
          name: 'asc',
        },
      });

      return menuItems;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  },
  ['menu-items'],
  {
    revalidate: 180, // Cache for 3 minutes
    tags: ['menu-items'],
  }
);

// Function to get user profile (not cached as it's user-specific)
export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        kitchens: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Function to get kitchen dashboard data
export async function getKitchenDashboard(kitchenId: string) {
  try {
    const [kitchen, recentOrders, menuStats] = await Promise.all([
      prisma.kitchen.findUnique({
        where: { id: kitchenId },
        include: {
          menuItems: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: { kitchenId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      }),
      prisma.menuItem.aggregate({
        where: { kitchenId },
        _count: { id: true },
        _sum: { price: true },
      }),
    ]);

    return {
      kitchen,
      recentOrders,
      menuStats: {
        totalItems: menuStats._count.id,
        averagePrice: menuStats._sum.price ? menuStats._sum.price / menuStats._count.id : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching kitchen dashboard:', error);
    return null;
  }
}