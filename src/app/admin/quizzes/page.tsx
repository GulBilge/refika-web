'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Quiz = {
  id: string
  question: string
  term_id: string | null
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [question, setQuestion] = useState('')
  type Option = { text: string; is_correct: boolean }
  const [options, setOptions] = useState<Option[]>([{ text: '', is_correct: false }])

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function fetchQuizzes() {
    const { data } = await supabase.from('quizzes').select('id, question, term_id')
    setQuizzes(data || [])
  }

  async function handleDelete(id: string) {
    if (!confirm('Quiz silinsin mi?')) return
    await supabase.from('quizzes').delete().eq('id', id)
    fetchQuizzes()
  }

  async function handleAddQuiz() {
    if (!question.trim() || options.length === 0) return

    const { data: quizInsert, error } = await supabase
      .from('quizzes')
      .insert({ question })
      .select('id')
      .single()

    if (quizInsert) {
      const quizId = quizInsert.id
      const formattedOptions = options.map((o) => ({
        text: o.text,
        is_correct: o.is_correct,
        quiz_id: quizId,
      }))
      await supabase.from('options').insert(formattedOptions)

      setQuestion('')
      setOptions([{ text: '', is_correct: false }])
      fetchQuizzes()
    }
  }
  function handleOptionChange(index: number, field: keyof Option, value: string | boolean) {
    const updated = [...options]
    updated[index][field] = value as never
    setOptions(updated)
  }

  function addOptionField() {
    setOptions([...options, { text: '', is_correct: false }])
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📋 Quizler</h1>

      <div className="mb-10 border p-4 rounded-xl">
        <h2 className="font-semibold mb-2">Yeni Quiz Ekle</h2>
        <input
          type="text"
          placeholder="Quiz sorusu"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border w-full p-2 rounded-xl mb-4"
        />

        <div className="space-y-3 mb-4">
          {options.map((option, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={option.text}
                placeholder={`Seçenek ${idx + 1}`}
                onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                className="flex-1 border px-2 py-1 rounded-xl"
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={(e) => handleOptionChange(idx, 'is_correct', e.target.checked)}
                />
                Doğru mu?
              </label>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={addOptionField}
            className="bg-gray-200 px-3 py-1 rounded-xl text-sm"
          >
            + Seçenek Ekle
          </button>
          <button
            onClick={handleAddQuiz}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
          >
            Quiz Oluştur
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="border p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{quiz.question}</p>
              <Link
                href={`/admin/quizzes/${quiz.id}`}
                className="text-sm text-indigo-600 underline"
              >
                Detay
              </Link>
              {quiz.term_id && (
                <span className="ml-2 text-xs text-gray-500">(bir döneme ait)</span>
              )}
            </div>
            <button
              onClick={() => handleDelete(quiz.id)}
              className="text-red-500 text-sm"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
