import { prisma } from '../lib/prisma';

async function main() {
  // Create a sample user
  const user = await prisma.user.upsert({
    where: { phone: '+8801234567890' },
    update: {},
    create: {
      phone: '+8801234567890',
      name: 'Sample Owner',
      email: 'owner@khabee.com',
      role: 'KITCHEN_OWNER',
    },
  });

  console.log('Created user:', user);

  // Create three sample kitchens
  const kitchens = [
    {
      name: "Ammi's Kitchen",
      description: 'Authentic home-cooked Bangladeshi meals',
      logo: '🏠',
      address: '123 Gulshan Avenue, Dhaka',
      ownerId: user.id,
    },
    {
      name: 'Burger Haven',
      description: 'Juicy burgers and crispy fries',
      logo: '🍔',
      address: '456 Dhanmondi Road, Dhaka',
      ownerId: user.id,
    },
    {
      name: 'Pasta Paradise',
      description: 'Italian pasta dishes made with love',
      logo: '🍝',
      address: '789 Banani Street, Dhaka',
      ownerId: user.id,
    },
  ];

  for (const kitchenData of kitchens) {
    const kitchen = await prisma.kitchen.create({
      data: kitchenData,
    });
    console.log('Created kitchen:', kitchen);

    // Create 4 menu items for each kitchen
    const menuItems = [
      {
        name: 'Chicken Biryani',
        price: 250.00,
        description: 'Fragrant basmati rice with tender chicken and spices',
        image: 'https://via.placeholder.com/300x200?text=Chicken+Biryani',
        kitchenId: kitchen.id,
      },
      {
        name: 'Beef Burger',
        price: 180.00,
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        image: 'https://via.placeholder.com/300x200?text=Beef+Burger',
        kitchenId: kitchen.id,
      },
      {
        name: 'Carbonara Pasta',
        price: 220.00,
        description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
        image: 'https://via.placeholder.com/300x200?text=Carbonara+Pasta',
        kitchenId: kitchen.id,
      },
      {
        name: 'Chocolate Cake',
        price: 120.00,
        description: 'Rich chocolate cake with vanilla frosting',
        image: 'https://via.placeholder.com/300x200?text=Chocolate+Cake',
        kitchenId: kitchen.id,
      },
    ];

    for (const item of menuItems) {
      const menuItem = await prisma.menuItem.create({
        data: item,
      });
      console.log('Created menu item:', menuItem);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Singleton, no disconnect needed
  });