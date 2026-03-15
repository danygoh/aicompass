import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update admin user with password
  const admin = await prisma.user.update({
    where: { email: 'dcwgoh@gmail.com' },
    data: {
      passwordHash: '$2b$10$Q5FiX0GGx.sMuT9rOBkPD.Ap.xFvwW34peSeKyYGN8CnDpaaHLBRC',
    },
  })
  console.log('Admin password updated:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
