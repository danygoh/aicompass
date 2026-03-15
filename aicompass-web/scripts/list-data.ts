import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log('=== COUNTS ===')
  const userCount = await prisma.user.count()
  const assessmentCount = await prisma.assessment.count()
  const reportCount = await prisma.report.count()
  const cohortCount = await prisma.cohort.count()
  console.log(`Users: ${userCount}`)
  console.log(`Assessments: ${assessmentCount}`)
  console.log(`Reports: ${reportCount}`)
  console.log(`Cohorts: ${cohortCount}`)

  console.log('\n=== USERS ===')
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { profile: true }
  })
  users.forEach(u => {
    console.log(`ID: ${u.id}`)
    console.log(`  Email: ${u.email}`)
    console.log(`  Name: ${u.name}`)
    console.log(`  Role: ${u.role}`)
    console.log(`  Company: ${u.profile?.company || '-'}`)
    console.log(`  Created: ${u.createdAt}`)
    console.log('')
  })

  console.log('=== COHORTS ===')
  const cohorts = await prisma.cohort.findMany({
    orderBy: { createdAt: 'desc' }
  })
  cohorts.forEach(c => {
    console.log(`ID: ${c.id}`)
    console.log(`  Name: ${c.name}`)
    console.log(`  Code: ${c.code}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
