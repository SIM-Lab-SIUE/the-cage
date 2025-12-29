// scripts/seed-dev-data.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Upsert test user matching JWT id used by dev credentials
  const userId = 'dev-ap@simdadllc.com'
  const email = 'ap@simdadllc.com'
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      snipeItUserId: 1000001,
      email,
      name: 'AP Simdad LLC',
      weekQuotaUsed: 0,
      hasOutstandingBalance: false,
    },
  })

  // Upsert a basic asset for booking
  await prisma.asset.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      assetTag: 'CAM-0001',
      modelName: 'Sony FX3',
      category: 'Video Camera',
    },
  })

  console.log('✓ Seeded dev user and asset')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
