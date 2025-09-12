'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { toast } from '@/components/ui/toast'
import { v4 as uuidv4 } from 'uuid'

// Tip tanımları
type Option = {
  id: string
  text: string
  is_correct: boolean
  isNew?: boolean
}

type Question = {
  id: string
  text: string
  points: number
  options: Option[]
  isNew?: boolean
}

type Term = {
  id: string
  name: string
}

export default function QuizEditPage() {
  const { id: quizId } = useParams() as { id: string }
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [termId, setTermId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Veri yükleme işlemi
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const { data: quizData, error: quizError } = await supabase
          .from('activities')
          .select(`
            id,
            title,
            term_id,
            questions (
              id,
              text,
              points,
              options (
                id,
                text,
                is_correct
              )
            )
          `)
          .eq('id', quizId)
          .single()

        if (quizError) throw quizError

        const { data: termData, error: termError } = await supabase.from('terms').select('id, name')
        if (termError) throw termError
        setTerms(termData)

        setTitle(quizData.title)
        setTermId(quizData.term_id)
        setQuestions(quizData.questions.map((q: any) => ({
          ...q,
          isNew: false,
          options: q.options.map((o: any) => ({ ...o, isNew: false }))
        })))
      } catch (e: any) {
        toast.error('Veri yüklenirken hata oluştu: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [quizId])

  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        id: uuidv4(),
        text: '',
        points: 0,
        isNew: true,
        options: [
          { id: uuidv4(), text: '', is_correct: false, isNew: true },
          { id: uuidv4(), text: '', is_correct: false, isNew: true },
        ],
      },
    ])
  }, [])

  const handleRemoveQuestion = useCallback((idToRemove: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== idToRemove))
  }, [])

  const handleAddOption = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [...q.options, { id: uuidv4(), text: '', is_correct: false, isNew: true }],
            }
          : q
      )
    )
  }, [])

  const handleRemoveOption = useCallback((questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      )
    )
  }, [])

  const handleQuestionChange = useCallback((id: string, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }, [])

  const handleOptionChange = useCallback((questionId: string, optionId: string, value: string) => {
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
  }, [])

  const handleCorrectOptionChange = useCallback((questionId: string, optionId: string) => {
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
  }, [])

  // Kaydetme işlemi
  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Veri Doğrulama
      if (!title.trim() || !termId) {
        toast.error('Başlık ve Dönem seçimi zorunludur.')
        setSaving(false)
        return
      }

      for (const q of questions) {
        if (!q.text.trim()) {
          toast.error('Tüm soruların metni doldurulmalıdır.')
          setSaving(false)
          return
        }
        if (q.options.some(o => !o.text.trim())) {
          toast.error('Tüm seçeneklerin metni doldurulmalıdır.')
          setSaving(false)
          return
        }
      }

      // 2. Quiz'i Güncelle
      const { error: quizError } = await supabase
        .from('activities')
        .update({ title, term_id: termId })
        .eq('id', quizId)
      if (quizError) throw quizError

      // 3. Mevcut ve Yeni soruları ayır
      const existingQuestions = questions.filter(q => !q.isNew)
      const newQuestions = questions.filter(q => q.isNew)

      // 4. Soruları silme: mevcut DB sorularından, formda olmayanları sil
      const { data: dbQuestions } = await supabase.from('questions').select('id').eq('quiz_id', quizId)
      const existingQuestionIds = dbQuestions?.map(q => q.id) || []
      const currentQuestionIds = existingQuestions.map(q => q.id)
      const questionsToDelete = existingQuestionIds.filter(id => !currentQuestionIds.includes(id))

      if (questionsToDelete.length > 0) {
        await supabase.from('questions').delete().in('id', questionsToDelete)
      }

      // 5. Yeni soruları kaydet
      const questionsToInsert = newQuestions.map(q => ({
        quiz_id: quizId,
        text: q.text,
        points: q.points
      }))

      if (questionsToInsert.length > 0) {
        const { data: insertedQuestions, error } = await supabase
          .from('questions')
          .insert(questionsToInsert)
          .select('id')
        if (error) throw error
        
        // Yeni eklenen soruların ID'lerini al ve seçeneklerini kaydet
        for (let i = 0; i < newQuestions.length; i++) {
            const newQId = insertedQuestions?.[i]?.id
            if (newQId) {
                const optionsToInsert = newQuestions[i].options.map(o => ({
                    question_id: newQId,
                    text: o.text,
                    is_correct: o.is_correct
                }))
                if (optionsToInsert.length > 0) {
                    await supabase.from('options').insert(optionsToInsert)
                }
            }
        }
      }

      // 6. Mevcut soruları ve seçeneklerini güncelle
      for (const q of existingQuestions) {
        // Soru metni ve puanı güncelle
        await supabase.from('questions').update({ text: q.text, points: q.points }).eq('id', q.id)
        
        // Seçenekleri silme: mevcut DB seçeneklerinden, formda olmayanları sil
        const { data: dbOptions } = await supabase.from('options').select('id').eq('question_id', q.id)
        const existingOptionIds = dbOptions?.map(o => o.id) || []
        const currentOptionIds = q.options.map(o => o.id)
        const optionsToDelete = existingOptionIds.filter(id => !currentOptionIds.includes(id))
        
        if (optionsToDelete.length > 0) {
          await supabase.from('options').delete().in('id', optionsToDelete)
        }
        
        // Yeni seçenekleri kaydetme ve mevcut seçenekleri güncelleme
        const optionsToInsert = q.options.filter(o => o.isNew).map(o => ({
          question_id: q.id,
          text: o.text,
          is_correct: o.is_correct
        }))
        
        const optionsToUpdate = q.options.filter(o => !o.isNew)

        if (optionsToInsert.length > 0) {
          await supabase.from('options').insert(optionsToInsert)
        }

        if (optionsToUpdate.length > 0) {
          await Promise.all(optionsToUpdate.map(o => 
            supabase.from('options').update({ text: o.text, is_correct: o.is_correct }).eq('id', o.id)
          ))
        }
      }

      toast.success('Sınav başarıyla güncellendi! 🎉')
      router.push('/admin/quizzes')

    } catch (e: any) {
      console.error(e)
      toast.error('Kaydetme sırasında bir hata oluştu: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-lg mt-8">Yükleniyor...</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Sınavı Düzenle</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Sınav Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <select
          value={termId ?? ''}
          onChange={(e) => setTermId(e.target.value || null)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Dönem Seç</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>

        {questions.map((q, qIndex) => (
          <div key={q.id} className="border rounded p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Soru {qIndex + 1}</h2>
              <button
                onClick={() => handleRemoveQuestion(q.id)}
                className="text-red-500"
              >
                Sil
              </button>
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
            
            {q.options.map((opt, oIndex) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Seçenek ${oIndex + 1}`}
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
            <button
              onClick={() => handleAddOption(q.id)}
              className="text-sm text-blue-500 mt-1"
            >
              + Seçenek Ekle
            </button>
          </div>
        ))}

        <button onClick={handleAddQuestion} className="text-blue-600 mt-2">
          + Soru Ekle
        </button>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}