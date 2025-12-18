'use server';

import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateMenuItem(
  menuItemId: string,
  data: {
    name?: string;
    price?: number;
    description?: string;
    image?: string;
  }
) {
  try {
    // Verify ownership
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { kitchen: true },
    });

    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check if user owns the kitchen
    if (menuItem.kitchen.ownerId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data,
    });

    // Revalidate cache
    revalidatePath(`/kitchen/${menuItem.kitchenId}`);
    revalidatePath('/');

    return {
      success: true,
      menuItem: updatedItem,
    };
  } catch (error) {
    console.error('Error updating menu item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update menu item',
    };
  }
}

export async function addMenuItem(
  kitchenId: string,
  data: {
    name: string;
    price: number;
    description?: string;
    image?: string;
  }
) {
  try {
    // Verify ownership
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
    });

    if (!kitchen) {
      throw new Error('Kitchen not found');
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check if user owns the kitchen
    if (kitchen.ownerId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    // Create the menu item
    const newItem = await prisma.menuItem.create({
      data: {
        ...data,
        kitchenId,
      },
    });

    // Revalidate cache
    revalidatePath(`/kitchen/${kitchenId}`);
    revalidatePath('/');

    return {
      success: true,
      menuItem: newItem,
    };
  } catch (error) {
    console.error('Error adding menu item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add menu item',
    };
  }
}

export async function deleteMenuItem(menuItemId: string) {
  try {
    // Verify ownership
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { kitchen: true },
    });

    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check if user owns the kitchen
    if (menuItem.kitchen.ownerId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id: menuItemId },
    });

    // Revalidate cache
    revalidatePath(`/kitchen/${menuItem.kitchenId}`);
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete menu item',
    };
  }
}

export async function updateKitchenProfile(
  kitchenId: string,
  data: {
    name?: string;
    description?: string;
    logo?: string;
    address?: string;
  }
) {
  try {
    // Verify ownership
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
    });

    if (!kitchen) {
      throw new Error('Kitchen not found');
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check if user owns the kitchen
    if (kitchen.ownerId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    // Update the kitchen
    const updatedKitchen = await prisma.kitchen.update({
      where: { id: kitchenId },
      data,
    });

    // Revalidate cache
    revalidatePath(`/kitchen/${kitchenId}`);
    revalidatePath('/');

    return {
      success: true,
      kitchen: updatedKitchen,
    };
  } catch (error) {
    console.error('Error updating kitchen profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update kitchen profile',
    };
  }
}