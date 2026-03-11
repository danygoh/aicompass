/**
 * Run with: npx ts-node --project tsconfig.json prisma/seed-admin.ts
 * Or: npx tsx prisma/seed-admin.ts
 *
 * Creates an ADMIN user in the database.
 * Set ADMIN_EMAIL and ADMIN_PASSWORD env vars, or use defaults below.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@compass.ai';
  const password = process.env.ADMIN_PASSWORD || 'Admin@Compass2026!';
  const name = process.env.ADMIN_NAME || 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Update existing user to ADMIN role
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Updated existing user to ADMIN: ${updated.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'ADMIN',
      subscription: 'ENTERPRISE',
    },
  });

  console.log(`✅ Created admin user: ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: ${user.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
