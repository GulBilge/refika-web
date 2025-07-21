'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import QuizCard from '@/components/student/QuizCard'
import Pagination from '@/components/student/Pagination'

type Quiz = {
  id: number;
  title: string;
};

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [termId, setTermId] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: userData } = await supabase
        .from('users')
        .select('term_id')
        .eq('id', user?.id)
        .single()

      if (!userData) return

      setTermId(userData.term_id)

      const { data, count } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact' })
        .eq('term_id', userData.term_id)
        .ilike('title', `%${search}%`)
        .range((page - 1) * limit, page * limit - 1)

      setQuizzes(data || [])
      setTotal(count || 0)
    }

    fetchQuizzes()
  }, [page, limit, search])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Quizzes</h1>

      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-2 py-1 mb-4 rounded"
      />

      <ul className="space-y-2">
        {quizzes.map((quiz: any) => (
          <QuizCard key={quiz.id} title={quiz.title} id={quiz.id} />
        ))}
      </ul>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        setPage={setPage}
        setLimit={setLimit}
      />
    </div>
  )
}
