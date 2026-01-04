// scripts/seed-dev-data.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding development data...')
  
  // Create test users (admins and students)
  const adminEmails = [
    { email: 'aleith@siue.edu', name: 'Alex Leith', snipeItId: 1001 },
    { email: 'tpauli@siue.edu', name: 'Tom Pauli', snipeItId: 1002 },
    { email: 'bemoyer@siue.edu', name: 'Ben Moyer', snipeItId: 1003 },
  ]
  
  const studentEmails = [
    { email: 'jsmith@siue.edu', name: 'John Smith', snipeItId: 2001 },
    { email: 'mjones@siue.edu', name: 'Mary Jones', snipeItId: 2002 },
    { email: 'bwilson@siue.edu', name: 'Bob Wilson', snipeItId: 2003 },
  ]
  
  // Insert users
  for (const user of [...adminEmails, ...studentEmails]) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.email,
        email: user.email,
        name: user.name,
        snipeItUserId: user.snipeItId,
        weekQuotaUsed: 0,
        hasOutstandingBalance: false,
      },
    })
  }
  console.log(`✓ Created ${adminEmails.length} admins and ${studentEmails.length} students`)

  // Create sample courses
  const courses = [
    { id: 1, code: 'COMM-226', semester: 'Spring 2026' },
    { id: 2, code: 'COMM-326', semester: 'Spring 2026' },
    { id: 3, code: 'COMM-426', semester: 'Spring 2026' },
    { id: 4, code: 'COMM-330', semester: 'Spring 2026' },
  ]
  
  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {},
      create: {
        id: course.id,
        code: course.code,
        semester: course.semester,
      },
    })
  }
  console.log(`✓ Created ${courses.length} courses`)

  // Create sample assets
  const assets = [
    { id: 101, tag: 'CAM-0001', model: 'Sony FX3', category: 'Camera' },
    { id: 102, tag: 'CAM-0002', model: 'Canon EOS R5', category: 'Camera' },
    { id: 103, tag: 'CAM-0003', model: 'Sony A7S III', category: 'Camera' },
    { id: 104, tag: 'LENS-0001', model: 'Sony 24-70mm f/2.8', category: 'Lens' },
    { id: 105, tag: 'LENS-0002', model: 'Canon RF 50mm f/1.2', category: 'Lens' },
    { id: 106, tag: 'AUDIO-0001', model: 'Zoom H6', category: 'Audio Recorder' },
    { id: 107, tag: 'AUDIO-0002', model: 'Sennheiser MKH 416', category: 'Microphone' },
    { id: 108, tag: 'LIGHT-0001', model: 'Aputure 300d II', category: 'Lighting' },
  ]
  
  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { assetTag: asset.tag },
      update: {
        modelName: asset.model,
        category: asset.category,
      },
      create: {
        id: asset.id,
        assetTag: asset.tag,
        modelName: asset.model,
        category: asset.category,
      },
    })
  }
  console.log(`✓ Created ${assets.length} assets`)

  // Enroll students in courses
  const student1 = await prisma.user.findUnique({ where: { email: 'jsmith@siue.edu' } })
  const student2 = await prisma.user.findUnique({ where: { email: 'mjones@siue.edu' } })
  const course1 = await prisma.course.findUnique({ where: { id: 1 } })
  const course2 = await prisma.course.findUnique({ where: { id: 2 } })
  
  if (student1 && course1) {
    await prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: student1.id,
          courseId: course1.id,
        },
      },
      update: {},
      create: {
        userId: student1.id,
        courseId: course1.id,
      },
    })
  }
  
  if (student2 && course2) {
    await prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: student2.id,
          courseId: course2.id,
        },
      },
      update: {},
      create: {
        userId: student2.id,
        courseId: course2.id,
      },
    })
  }
  console.log('✓ Enrolled students in courses')

  console.log('🎉 Seeding complete!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
