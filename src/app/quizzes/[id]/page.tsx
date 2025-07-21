'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import QuizFlow from '@/components/student/QuizFlow'

export default function StudentQuizDetail() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true)
    const { data, error } = await supabase
    .from('quizzes')
    .select(`
        id,
        title,
        questions:questions!fk_questions_quiz (
        id,
        text,
        options:options!fk_options_question (
            id,
            text,
            is_correct
        ),
        points
        )
    `)
    .eq('id', id)
    .single()


      setQuiz(data)
      setLoading(false)
    }

    if (id) fetchQuiz()
  }, [id])

  if (loading) return <p className="p-4 text-sm">Loading...</p>
  if (!quiz) return <p className="p-4 text-sm">Quiz not found.</p>

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg sm:text-xl font-bold text-blue-700">{quiz.title}</h1>
<QuizFlow questions={quiz.questions} />
    </div>
  )
}
