import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@restaurante.com';
  const waiterEmail = 'waiter@restaurante.com';
  const kitchenEmail = 'kitchen@restaurante.com';

  const adminPass = await bcrypt.hash('Admin123*', 10);
  const waiterPass = await bcrypt.hash('Waiter123*', 10);
  const kitchenPass = await bcrypt.hash('Kitchen123*', 10);

  // -------------------------
  // USERS (upsert para no duplicar)
  // -------------------------
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin',
      roles: [Role.ADMIN],
      isActive: true,
      textSearch: 'admin'+adminEmail.toLowerCase() // Campo adicional para búsqueda rápida
    },
    create: {
      name: 'Admin',
      email: adminEmail,
      password: adminPass,
      roles: [Role.ADMIN],
      isActive: true,
      textSearch: 'admin'+adminEmail.toLowerCase() // Campo adicional para búsqueda rápida
    },
  });

  const waiter = await prisma.user.upsert({
    where: { email: waiterEmail },
    update: {
      name: 'Mesero 1',
      roles: [Role.WAITER],
      isActive: true,
      textSearch: 'waiter'+waiterEmail.toLowerCase() // Campo adicional para búsqueda rápida
    },
    create: {
      name: 'Mesero 1',
      email: waiterEmail,
      password: waiterPass,
      roles: [Role.WAITER],
      isActive: true,
      textSearch: 'waiter'+waiterEmail.toLowerCase() // Campo adicional para búsqueda rápida
    },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: kitchenEmail },
    update: {
      name: 'Cocina 1',
      roles: [Role.KITCHEN],
      isActive: true,
      textSearch: 'kitchen'+kitchenEmail.toLowerCase() // Campo adicional para búsqueda rápida
    },
    create: {
      name: 'Cocina 1',
      email: kitchenEmail,
      password: kitchenPass,
      roles: [Role.KITCHEN],
      isActive: true,
      textSearch: 'kitchen'+kitchenEmail.toLowerCase() // Campo adicional para búsqueda rápida
    },
  });

  // -------------------------
  // TABLES (createMany + skipDuplicates)
  // -------------------------
  /*await prisma.table.createMany({
    data: [
      { name: 'Mesa 1', textSearch: 'mesa1' },
      { name: 'Mesa 2', textSearch: 'mesa2' },
      { name: 'Terraza 1', textSearch: 'terraza1' },
    ],
    skipDuplicates: true,
  });

  const tables = await prisma.table.findMany({
    where: { name: { in: ['Mesa 1', 'Mesa 2', 'Terraza 1'] } },
    select: { id: true, name: true },
  }); */

  // -------------------------
  // CATEGORIES (upsert)
  // -------------------------
  const catEntradas = await prisma.category.upsert({
    where: { name: 'Entradas' },
    update: { isActive: true, textSearch: 'entradas' },
    create: { name: 'Entradas', isActive: true, textSearch: 'entradas' },
  });

  const catBebidas = await prisma.category.upsert({
    where: { name: 'Bebidas' },
    update: { isActive: true, textSearch: 'bebidas' },
    create: { name: 'Bebidas', isActive: true, textSearch: 'bebidas' },
  });

  // -------------------------
  // MENU ITEMS (upsert)
  // Nota: Como no tienes unique por name en MenuItem, usaremos find+create
  // (si quieres, luego hacemos @@unique([name, categoryId]))
  // -------------------------
  const menuSeed = [
    // Entradas
    { name: 'Guacamole', description: 'Con totopos', price: '85.00', categoryId: catEntradas.id, textSearch: 'guacamolecontotopos' },
    { name: 'Quesadillas', description: '3 piezas', price: '95.00', categoryId: catEntradas.id, textSearch: 'quesadillas3piezas' },
    { name: 'Nachos', description: 'Con queso y jalapeño', price: '110.00', categoryId: catEntradas.id, textSearch: 'nachosconquesoyjalapeno' },

    // Bebidas
    { name: 'Agua natural', description: '600 ml', price: '25.00', categoryId: catBebidas.id, textSearch: 'aguanatural600ml' },
    { name: 'Refresco', description: '355 ml', price: '35.00', categoryId: catBebidas.id, textSearch: 'refresco355ml' },
    { name: 'Café americano', description: 'Taza', price: '45.00', categoryId: catBebidas.id, textSearch: 'cafeamericano' },
  ];

  for (const item of menuSeed) {
    const exists = await prisma.menuItem.findFirst({
      where: { name: item.name, categoryId: item.categoryId },
      select: { id: true },
    });

    if (!exists) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price as any, // Prisma Decimal
          categoryId: item.categoryId,
          isActive: true,
        },
      });
    }
  }

  // -------------------------
  // Opcional: crear 1 orden de ejemplo (comentado)
  // -------------------------
  /*
  const mesa1 = tables.find(t => t.name === 'Mesa 1');
  const guacamole = await prisma.menuItem.findFirst({ where: { name: 'Guacamole' } });
  const cafe = await prisma.menuItem.findFirst({ where: { name: 'Café americano' } });

  if (mesa1 && guacamole && cafe) {
    await prisma.order.create({
      data: {
        tableId: mesa1.id,
        waiterId: waiter.id,
        status: 'NEW',
        notes: 'Orden de prueba',
        items: {
          create: [
            { menuItemId: guacamole.id, quantity: 1, unitPrice: guacamole.price },
            { menuItemId: cafe.id, quantity: 2, unitPrice: cafe.price, notes: 'sin azúcar' },
          ],
        },
      },
    });
  }
  */

  console.log('✅ Seed completado:');
  console.log('ADMIN:', adminEmail, 'Admin123*');
  console.log('WAITER:', waiterEmail, 'Waiter123*');
  console.log('KITCHEN:', kitchenEmail, 'Kitchen123*');
  //console.log('Mesas:', tables.map(t => t.name).join(', '));
  console.log('Categorías:', catEntradas.name, ',', catBebidas.name);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
