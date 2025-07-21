'use client'

import { supabase } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

type Option = {
  is_correct?: boolean
  id?: string
  text: string
}

type Question = {
  id?: string
  text: string
  points: number
  options: Option[]
}

type Term = {
  id: string
  name: string
}

interface QuizDetailFormProps {
  onSave?: () => void
}

const fetchTerms = async () => {
  const { data, error } = await supabase.from('terms').select('id, name').order('name')
  if (error) throw error
  return data || []
}

const fetchQuizAndQuestions = async (quizId: string) => {
  const { data: quizData, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title, term_id')
    .eq('id', quizId)
    .single()
  if (quizError) throw quizError

  const { data: questionRows, error: questionError } = await supabase
    .from('questions')
    .select('id, text, points')
    .eq('quiz_id', quizId)
    .order('id')
  if (questionError) throw questionError

  const questionsWithOptions = await Promise.all(
    (questionRows || []).map(async (q) => {
      const { data: optionRows, error: optionError } = await supabase
        .from('options')
        .select('id, text, is_correct')
        .eq('question_id', q.id)
        .order('id')
      if (optionError) throw optionError
      return {
        ...q,
        options: optionRows?.map((opt) => ({ id: opt.id, text: opt.text, is_correct: opt.is_correct })) || [],
      }
    })
  )

  return { quizData, questionsWithOptions }
}

const saveQuizData = async (quizId: string, title: string, termId: string | null, questions: Question[]) => {
  const { error: quizUpdateError } = await supabase
    .from('quizzes')
    .update({ title, term_id: termId })
    .eq('id', quizId)
  if (quizUpdateError) throw quizUpdateError

  for (const q of questions) {
    let questionId = q.id
    if (questionId) {
      const { error: qError } = await supabase
        .from('questions')
        .update({ text: q.text, points: q.points })
        .eq('id', questionId)
      if (qError) throw qError
    } else {
      const { data: insertedQ, error: qInsertError } = await supabase
        .from('questions')
        .insert([{ quiz_id: quizId, text: q.text, points: q.points }])
        .select('id')
        .single()
      if (qInsertError) throw qInsertError
      questionId = insertedQ.id
      q.id = questionId
    }

    const { data: existingOptionIds, error: optFetchError } = await supabase
      .from('options')
      .select('id')
      .eq('question_id', questionId)
    if (optFetchError) throw optFetchError

    const optionsToDelete = existingOptionIds
      .filter((eo) => !q.options.some((o) => o.id === eo.id))
      .map((o) => o.id)

    if (optionsToDelete.length > 0) {
      const { error: optDelError } = await supabase.from('options').delete().in('id', optionsToDelete)
      if (optDelError) throw optDelError
    }

    for (const o of q.options) {
      if (o.id) {
        const { error: optUpdateError } = await supabase
          .from('options')
          .update({ text: o.text, is_correct: o.is_correct ?? false })
          .eq('id', o.id)
        if (optUpdateError) throw optUpdateError
      } else {
        const { error: optInsertError } = await supabase
          .from('options')
          .insert([{ question_id: questionId, text: o.text, is_correct: o.is_correct ?? false }])
        if (optInsertError) throw optInsertError
      }
    }
  }
}

export default function QuizDetailForm({ onSave }: QuizDetailFormProps) {
  const { id: quizId } = useParams() as { id: string }
  const [title, setTitle] = useState('')
  const [termId, setTermId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [termData, { quizData, questionsWithOptions }] = await Promise.all([
          fetchTerms(),
          fetchQuizAndQuestions(quizId),
        ])
        setTerms(termData)
        setTitle(quizData.title ?? '')
        setTermId(quizData.term_id ?? null)
        setQuestions(questionsWithOptions)
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Veri yüklenirken hata oluştu.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [quizId])

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, { text: '', points: 0, options: [] }])
  }, [])

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateQuestionText = useCallback((index: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text } : q))
    )
  }, [])

  const updateQuestionPoints = useCallback((index: number, points: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, points } : q))
    )
  }, [])

  const addOption = useCallback((qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, { text: '', is_correct: false }] } : q
      )
    )
  }, [])

  const updateOptionText = useCallback((qIndex: number, oIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, j) => (j === oIndex ? { ...opt, text } : opt)),
            }
          : q
      )
    )
  }, [])

  const removeOption = useCallback((qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.filter((_, j) => j !== oIndex) } : q
      )
    )
  }, [])

  const handleCorrectOptionChange = useCallback((qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, j) => ({
                ...opt,
                is_correct: j === oIndex,
              })),
            }
          : q
      )
    )
  }, [])

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    if (totalPoints !== 100) {
      setError('Toplam puan 100 olmalı.')
      return
    }

    setSaving(true)
    try {
      await saveQuizData(quizId, title, termId, questions)
      setSuccess(true)
      onSave?.()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Kaydetme sırasında hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Yükleniyor...</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Quiz Detayları</h2>

      <label className="block mb-2 font-semibold">Quiz Başlığı</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Quiz başlığı"
      />

      <label className="block mb-2 font-semibold">Dönem (opsiyonel)</label>
      <select
        value={termId ?? ''}
        onChange={(e) => setTermId(e.target.value || null)}
        className="w-full p-2 border rounded mb-6"
      >
        <option value="">Dönem seçin</option>
        {terms.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div>
        <h3 className="text-xl font-semibold mb-4">Sorular</h3>

        {questions.map((q, qIndex) => (
          <div key={q.id || `new-${qIndex}`} className="mb-6 border p-4 rounded bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold">Soru {qIndex + 1}</label>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 font-bold"
                type="button"
              >
                Sil
              </button>
            </div>

            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
              placeholder="Soru metni"
              className="w-full p-2 border rounded mb-2"
            />

            <input
              type="number"
              min={0}
              max={100}
              value={q.points}
              onChange={(e) => updateQuestionPoints(qIndex, parseInt(e.target.value) || 0)}
              placeholder="Puan (0-100)"
              className="w-24 p-2 border rounded mb-4"
            />

            <div>
              <label className="font-semibold mb-1 block">Seçenekler</label>

              {q.options.map((opt, oIndex) => (
                <div key={opt.id || `new-opt-${oIndex}`} className="flex items-center mb-2 space-x-2">
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                    placeholder="Seçenek metni"
                    className="flex-grow p-2 border rounded"
                  />
                  <input
                    type="radio"
                    name={`correct-option-${q.id || qIndex}`}
                    checked={opt.is_correct ?? false}
                    onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                  />
                  <button
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="text-red-600 font-bold"
                    type="button"
                  >
                    X
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="mt-1 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Seçenek Ekle
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Yeni Soru Ekle
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">Başarıyla kaydedildi!</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  )
}