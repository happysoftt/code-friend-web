import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' // <--- ต้องมีบรรทัดนี้ครับ!

const prisma = new PrismaClient()

async function main() {
  // 1. Create Roles
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator',
      permissions: ['*']
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard User',
      permissions: ['read:public']
    }
  })

  // 2. Create Initial Categories
  await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Tutorials for modern web stack'
    }
  })

  // 3. Create Admin User
  await prisma.user.upsert({
    where: { email: 'admin@codefriend.com' },
    update: {
        password: hashedPassword 
    },
    create: {
      email: 'admin@codefriend.com',
      name: 'Admin CodeFriend',
      password: hashedPassword, 
      roleId: adminRole.id,
      profile: {
        create: {
          bio: 'I am the system administrator.',
          stack: 'Full-Stack'
        }
      }
    }
  })

  console.log('✅ Seed data initialized')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })