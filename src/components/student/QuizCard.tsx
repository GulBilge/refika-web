'use client'

import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react' // hafif, sade bir ikon
import type { FC } from 'react'

type Props = {
  title: string
  id: string
}

const QuizCard: FC<Props> = ({ title, id }) => {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/quizzes/${id}`)}
      className="flex items-center gap-3 border p-3 rounded shadow-sm hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition"
    >
      <BookOpen className="w-6 h-6 text-blue-500 shrink-0" />
      <span className="text-sm sm:text-base font-medium truncate">{title}</span>
    </div>
  )
}

export default QuizCard
