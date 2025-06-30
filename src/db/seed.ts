import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@refika.com' },
    update: {},
    create: { email: 'test@refika.com' },
  })

  const quiz = await prisma.quiz.create({
    data: {
      question: 'What is the Turkish word for "apple"?',
      options: {
        create: [
          { text: 'Elma', isCorrect: true },
          { text: 'Armut', isCorrect: false },
          { text: 'Muz', isCorrect: false },
          { text: 'Çilek', isCorrect: false },
        ],
      },
    },
  })

  console.log('Seed data created:', { user, quiz })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
