'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Toast from '@/components/Toast'

export default function NewQuizPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [termId, setTermId] = useState<string | null>(null)
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)

  // Dönemleri çek
  useEffect(() => {
    async function fetchTerms() {
      const { data } = await supabase.from('terms').select('id, name')
      setTerms(data || [])
    }
    fetchTerms()
  }, [])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        content: '',
        score: 0,
        options: [
          { id: uuidv4(), content: '', is_correct: false },
          { id: uuidv4(), content: '', is_correct: false },
        ],
      },
    ])
  }

  const handleQuizSubmit = async () => {
    const totalScore = questions.reduce((sum, q) => sum + Number(q.score), 0)
    if (totalScore !== 100) {
      setToast({ message: 'Toplam puan 100 olmalı.', type: 'error' })
      return
    }

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{ title, term_id: termId }])
      .select()
      .single()

    if (quizError || !quiz) {
      setToast({ message: 'Quiz kaydedilemedi.', type: 'error' })
      return
    }else {
      setToast({ message: 'Quiz başarıyla kaydedildi.', type: 'success' })
    }

    for (const q of questions) {
      const { data: question } = await supabase
        .from('questions')
        .insert([{ quiz_id: quiz.id, content: q.content, score: q.score }])
        .select()
        .single()

      if (question) {
        await supabase.from('options').insert(
          q.options.map((opt: any) => ({
            question_id: question.id,
            content: opt.content,
            is_correct: opt.is_correct,
          }))
        )
      }
    }

    router.push('/admin/quizzes')
  }

  return (
    
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Quiz Oluştur</h1>

      <input
        type="text"
        placeholder="Quiz başlığı"
        className="w-full border p-2 rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        value={termId || ''}
        onChange={(e) => setTermId(e.target.value || null)}
        className="w-full border p-2 rounded mb-6"
      >
        <option value="">Dönem seç (opsiyonel)</option>
        {terms.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="space-y-6 mb-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="border p-4 rounded shadow">
            <input
              type="text"
              placeholder={`Soru ${qi + 1}`}
              className="w-full border p-2 rounded mb-2"
              value={q.content}
              onChange={(e) => {
                const updated = [...questions]
                updated[qi].content = e.target.value
                setQuestions(updated)
              }}
            />
            <p>Puan</p>
            <input
              type="number"
              placeholder="Puan"
              className="w-full border p-2 rounded mb-2"
              value={q.score}
              onChange={(e) => {
                const updated = [...questions]
                updated[qi].score = Number(e.target.value)
                setQuestions(updated)
              }}
            />
            <div className="space-y-2">
              {q.options.map((opt: any, oi: number) => (
                <div key={opt.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`Şık ${oi + 1}`}
                    className="flex-1 border p-2 rounded"
                    value={opt.content}
                    onChange={(e) => {
                      const updated = [...questions]
                      updated[qi].options[oi].content = e.target.value
                      setQuestions(updated)
                    }}
                  />
                  <label>
                    <input
                      type="radio"
                      checked={opt.is_correct}
                      onChange={() => {
                        const updated = [...questions]
                        updated[qi].options = updated[qi].options.map(
                          (o: any, idx: number) => ({
                            ...o,
                            is_correct: idx === oi,
                          })
                        )
                        setQuestions(updated)
                      }}
                    />{' '}
                    Doğru
                  </label>
                </div>
              ))}
              <button
                onClick={() => {
                  const updated = [...questions]
                  updated[qi].options.push({
                    id: uuidv4(),
                    content: '',
                    is_correct: false,
                  })
                  setQuestions(updated)
                }}
                className="text-blue-600 mt-2"
              >
                + Şık Ekle
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleAddQuestion}
          className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
        >
          + Soru Ekle
        </button>

        <button
          onClick={handleQuizSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Quiz Kaydet
        </button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} duration={5000} />}
    </div>
  )
}
