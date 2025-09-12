'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

type Quiz = {
  id: string
  title: string
  created_at: string
  term_id: string | null
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, created_at, term_id')
      .eq('activity_type', 'quiz')
      .order('created_at', { ascending: false })
    if (!error && data) setQuizzes(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Bu quiz silinecek. Emin misiniz?')
    if (!confirm) return
    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (!error) {
      fetchQuizzes()
    }
  }

  return (
      <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quizler</h1>
        <Link
          href="/admin/quizzes/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Yeni Quiz
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Quiz Listesi</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <ul className="space-y-4">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="flex items-center justify-between p-4 bg-white border rounded-xl shadow"
            >
              <div>
                <h3 className="text-lg font-semibold">{quiz.title}</h3>
                <p className="text-sm text-gray-500">
                  Oluşturulma: {new Date(quiz.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/quizzes/${quiz.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Detay
                </Link>
                <Button variant="destructive" onClick={() => handleDelete(quiz.id)}>
                  Sil
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
