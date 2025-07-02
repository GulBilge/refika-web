'use client' // Çünkü useEffect ile veri çekeceğiz

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import QuizOptions from '@/components/QuizOptions'

type Option = {
  id: string
  option_text: string
  is_correct: boolean
}

type Quiz = {
  id: string
  question: string
  options: Option[]
}

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)

  useEffect(() => {
    async function fetchQuiz() {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`id, question, options(id, option_text, is_correct)`)
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching quiz:', error)
      } else {
        setQuiz(data)
      }
    }
    fetchQuiz()
  }, [])

  if (!quiz) return <p>Loading...</p>

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{quiz.question}</h1>
      <QuizOptions options={quiz.options} />
    </main>
  )
}

