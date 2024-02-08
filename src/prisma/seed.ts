import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const password = await bcrypt.hash('1234qwer', 10);
  const user = await prisma.user.create({
    data: {
      firstName: 'Admin',
      roles: ['ADMIN'],
      userLogin: {
        create: {
          username: 'admin',
          email: 'nhaths4701@gmail.com',
          password: password,
          isEmailVerified: true,
        },
      },
    },
  });

  console.log(`Created user with id: ${user.id}`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
