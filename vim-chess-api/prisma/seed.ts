import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { role: 'Admin' },
    update: {},
    create: {
      role: 'Admin',
    },
  });
  await prisma.role.upsert({
    where: { role: 'User' },
    update: {},
    create: {
      role: 'User',
    },
  });
  const hashedPasswordAdminUser = await bcrypt.hash('kantin', 10);
  await prisma.user.upsert({
    where: { email: 'kantin.fagn@gmail.com' },
    update: {},
    create: {
      lastname: 'Fagniart',
      firstname: 'Kantin',
      email: 'kantin.fagn@gmail.com',
      username: 'Kavtiv',
      country: 'Algeria',
      password: hashedPasswordAdminUser,
      roleId: adminRole.id,
      elo: 100,
    },
  });
  await prisma.user.upsert({
    where: { email: 'julien.dante@ynov.com' },
    update: {},
    create: {
      lastname: 'Dante',
      firstname: 'Julien',
      email: 'julien.dante@ynov.com',
      username: 'Juliendnte',
      country: 'France',
      password: hashedPasswordAdminUser,
      roleId: adminRole.id,
      elo: 100,
    },
  });
}

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
