'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { toast } from '@/components/ui/toast' // kendi toast'ını kullan
import { v4 as uuidv4 } from 'uuid'

export default function NewQuizPage() {
  const [title, setTitle] = useState('')
  const [termId, setTermId] = useState('')
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([])
  const [questions, setQuestions] = useState([
    {
      id: uuidv4(),
      text: '',
      points: 0,
      options: [
        { id: uuidv4(), text: '', is_correct: false },
        { id: uuidv4(), text: '', is_correct: false },
      ],
    },
  ])
  const router = useRouter()

  useEffect(() => {
    async function fetchTerms() {
      const { data, error } = await supabase.from('terms').select('id, name')
      if (!error && data) setTerms(data)
    }
    fetchTerms()
  }, [])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        text: '',
        points: 0,
        options: [
          { id: uuidv4(), text: '', is_correct: false },
          { id: uuidv4(), text: '', is_correct: false },
        ],
      },
    ])
  }

  const handleAddOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [...q.options, { id: uuidv4(), text: '', is_correct: false }],
            }
          : q
      )
    )
  }

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      )
    )
  }

  const handleSubmit = async () => {
    const total = questions.reduce((sum, q) => sum + Number(q.points), 0)
    if (total !== 100) {
      toast.error('Toplam puan 100 olmalı')
      return
    }
    if (!title || !termId || questions.length === 0) {
      toast.error('Tüm alanlar doldurulmalı')
      return
    }

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({ title, term_id: termId })
      .select()
      .single()

    if (quizError || !quizData?.id) {
      toast.error('Quiz oluşturulamadı')
      return
    }

    for (const q of questions) {
      const { data: questionData, error: qError } = await supabase
        .from('questions')
        .insert({
          quiz_id: quizData.id,
          text: q.text,
          points: q.points,
        })
        .select()
        .single()

      if (qError || !questionData?.id) continue

      const optionsPayload = q.options.map((opt) => ({
        question_id: questionData.id,
        text: opt.text,
        is_correct: opt.is_correct,
      }))
      await supabase.from('options').insert(optionsPayload)
    }

    toast.success('Quiz başarıyla oluşturuldu')
    router.push('/admin/quizzes')
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Yeni Quiz Oluştur</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Quiz Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <select
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Dönem Seç</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>

        {questions.map((q, qi) => (
          <div key={q.id} className="border rounded p-4 space-y-2">
            <div className="flex justify-between">
              <h2 className="font-semibold">Soru {qi + 1}</h2>
              {questions.length > 1 && (
                <button onClick={() => handleRemoveQuestion(q.id)} className="text-red-500">
                  Sil
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Soru metni"
              value={q.text}
              onChange={(e) =>
                setQuestions((prev) =>
                  prev.map((item) =>
                    item.id === q.id ? { ...item, text: e.target.value } : item
                  )
                )
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Puan"
              value={q.points}
              onChange={(e) =>
                setQuestions((prev) =>
                  prev.map((item) =>
                    item.id === q.id ? { ...item, points: Number(e.target.value) } : item
                  )
                )
              }
              className="w-full border rounded px-3 py-2"
            />
            {q.options.map((opt, oi) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Seçenek ${oi + 1}`}
                  value={opt.text}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id
                          ? {
                              ...item,
                              options: item.options.map((o) =>
                                o.id === opt.id ? { ...o, text: e.target.value } : o
                              ),
                            }
                          : item
                      )
                    )
                  }
                  className="flex-1 border rounded px-3 py-2"
                />
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={opt.is_correct}
                  onChange={() =>
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id
                          ? {
                              ...item,
                              options: item.options.map((o) => ({
                                ...o,
                                is_correct: o.id === opt.id,
                              })),
                            }
                          : item
                      )
                    )
                  }
                />
                <button
                  onClick={() => handleRemoveOption(q.id, opt.id)}
                  className="text-red-500"
                >
                  x
                </button>
              </div>
            ))}
            <button
              onClick={() => handleAddOption(q.id)}
              className="text-sm text-blue-500 mt-1"
            >
              + Şık Ekle
            </button>
          </div>
        ))}

        <button onClick={handleAddQuestion} className="text-blue-600 mt-2">
          + Soru Ekle
        </button>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
