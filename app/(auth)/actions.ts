'use server';

import { prisma } from '../../lib/prisma';

export async function createUserProfile(userId: string, phone: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      // Create new user profile
      await prisma.user.create({
        data: {
          id: userId,
          phone: phone,
          name: '', // Will be updated later
          email: '', // Will be updated later
          role: 'CUSTOMER',
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: 'Failed to create user profile' };
  }
}