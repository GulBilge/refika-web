import { PrismaClient } from '@/generated/prisma'
import QuizOptions from '@/components/QuizOptions'

const prisma = new PrismaClient()

export default async function QuizPage() {
  const quiz = await prisma.quiz.findFirst({
    include: { options: true }
  })

  if (!quiz) return <p>No quiz found.</p>

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{quiz.question}</h1>
      {/* Client component çağrısı */}
      <QuizOptions options={quiz.options} />
    </main>
  )
}
