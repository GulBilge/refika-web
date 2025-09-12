'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { toast } from '@/components/ui/toast'
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
    setQuestions((prev) => [
      ...prev,
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

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
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
    // Adım 1: Temel hata kontrolleri
    if (!title) {
      toast.error('Lütfen bir sınav başlığı girin.')
      return
    }
    if (!termId) {
      toast.error('Lütfen bir dönem seçin.')
      return
    }
    if (questions.length === 0) {
      toast.error('En az bir soru eklemelisiniz.')
      return
    }

    // Adım 2: Form verilerini doğrulama
    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error('Tüm soruların metni doldurulmalıdır.')
        return
      }
      if (q.options.some(opt => !opt.text.trim())) {
        toast.error('Tüm seçeneklerin metni doldurulmalıdır.')
        return
      }
      if (!q.options.some(opt => opt.is_correct)) {
        toast.error('Her soru için en az bir doğru şık seçilmelidir.')
        return
      }
    }

    // Adım 3: Sınavı veritabanına kaydetme
    const { data: quizData, error: quizError } = await supabase
      .from('activities')
      .insert({ title, term_id: termId, activity_type: 'quiz' })
      .select('id')
      .single()

    if (quizError) {
      toast.error('Sınav oluşturulurken bir hata oluştu.')
      console.error(quizError)
      return
    }

    const quizId = quizData.id

    // Adım 4: Soruları ve seçenekleri toplu olarak kaydetme
    const questionsPayload = questions.map((q) => ({
      quiz_id: quizId,
      text: q.text,
      points: q.points,
    }))

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .insert(questionsPayload)
      .select('id, text')

    if (questionsError) {
      toast.error('Sorular kaydedilirken bir hata oluştu.')
      console.error(questionsError)
      // Quiz'i silmek isteyebilirsin
      await supabase.from('activities').delete().eq('id', quizId)
      return
    }

    const optionsPayload = questions.flatMap((q) => {
      const dbQuestion = questionsData.find((dbQ) => dbQ.text === q.text)
      return q.options.map((opt) => ({
        question_id: dbQuestion?.id,
        text: opt.text,
        is_correct: opt.is_correct,
      }))
    })

    const { error: optionsError } = await supabase
      .from('options')
      .insert(optionsPayload)

    if (optionsError) {
      toast.error('Seçenekler kaydedilirken bir hata oluştu.')
      console.error(optionsError)
      // Soruları ve quiz'i silmek isteyebilirsin
      await supabase.from('questions').delete().in('id', questionsData.map(q => q.id))
      await supabase.from('activities').delete().eq('id', quizId)
      return
    }

    toast.success('Sınav başarıyla oluşturuldu! 🎉')
    router.push('/admin/quizzes')
  }

  // Arayüzdeki input alanlarının state'lerini yönetmek için yardımcı fonksiyonlar
  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  const handleOptionChange = (questionId: string, optionId: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, text: value } : o
              ),
            }
          : q
      )
    )
  }

  const handleCorrectOptionChange = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => ({
                ...o,
                is_correct: o.id === optionId,
              })),
            }
          : q
      )
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Yeni Sınav Oluştur 📝</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Sınav Başlığı"
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
            <div className="flex justify-between items-center">
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
              onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Puan"
              value={q.points}
              onChange={(e) => handleQuestionChange(q.id, 'points', Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
            
            {q.options.map((opt, oi) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Seçenek ${oi + 1}`}
                  value={opt.text}
                  onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={opt.is_correct}
                  onChange={() => handleCorrectOptionChange(q.id, opt.id)}
                />
                <button
                  onClick={() => handleRemoveOption(q.id, opt.id)}
                  className="text-red-500"
                >
                  x
                </button>
              </div>
            ))}
            <button onClick={() => handleAddOption(q.id)} className="text-sm text-blue-500 mt-1">
              + Seçenek Ekle
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
            Sınavı Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}