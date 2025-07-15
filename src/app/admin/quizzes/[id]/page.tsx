'use client'

import { supabase } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

type Option = { id?: string; text: string }
type Question = {
  id?: string
  text: string
  score: number
  options: Option[]
}

type QuizDetail = {
  id: string
  title: string
  termId: string | null
  questions: Question[]
}

interface Props {
  quizId?: string
  onSave?: () => void
}

export default function QuizDetailForm({ onSave }: Props) {
  const { id: quizId } = useParams() as { id: string }
  const [title, setTitle] = useState('')
  const [termId, setTermId] = useState<string | null>(null)
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const totalscore = questions.reduce((sum, q) => sum + q.score, 0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: termData, error: termError } = await supabase
          .from('terms')
          .select('id, name')
          .order('name')

        if (termError) throw termError
        setTerms(termData || [])

        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()

        if (quizError) throw quizError
        setQuizDetail(quizData || { id: '', title: '', termId: null, questions: [] })

        if (quizData) {
          setTitle(quizData.title)
          setTermId(quizData.termId)
        }

        const { data: questionRows, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('id')

        if (questionError) throw questionError

        const questionsWithOptions = await Promise.all(
          (questionRows || []).map(async (q) => {
            const { data: optionRows, error: optionError } = await supabase
              .from('options')
              .select('*')
              .eq('question_id', q.id)
              .order('id')

            if (optionError) throw optionError

            return {
              id: q.id,
              text: q.text,
              score: q.score,
              options: optionRows?.map((opt) => ({ id: opt.id, text: opt.text })) || [],
            }
          })
        )

        setQuestions(questionsWithOptions)
      } catch (e) {
        console.error(e)
        setError('Veri yüklenirken hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [quizId])

  const addQuestion = () => {
    setQuestions([...questions, { text: '', score: 0, options: [] }])
  }

  const removeQuestion = (index: number) => {
    const updated = [...questions]
    updated.splice(index, 1)
    setQuestions(updated)
  }

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions]
    updated[index].text = text
    setQuestions(updated)
  }

  const updateQuestionscore = (index: number, score: number) => {
    const updated = [...questions]
    updated[index].score = score
    setQuestions(updated)
  }

  const addOption = (qIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options.push({ text: '' })
    setQuestions(updated)
  }

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex].text = text
    setQuestions(updated)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options.splice(oIndex, 1)
    setQuestions(updated)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    if (totalscore !== 100) {
      setError('Toplam puan 100 olmalı.')
      return
    }

    setSaving(true)

    try {
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
            .update({ text: q.text, score: q.score })
            .eq('id', questionId)

          if (qError) throw qError
        } else {
          const { data: insertedQ, error: qInsertError } = await supabase
            .from('questions')
            .insert([{ quiz_id: quizId, text: q.text, score: q.score }])
            .select()
            .single()

          if (qInsertError) throw qInsertError
          questionId = insertedQ.id
          q.id = questionId
        }

        const { data: existingOptions, error: optFetchError } = await supabase
          .from('options')
          .select('*')
          .eq('question_id', questionId)

        if (optFetchError) throw optFetchError

        const optionsToDelete = existingOptions
          .filter((eo) => !q.options.find((o) => o.id === eo.id))
          .map((o) => o.id)

        if (optionsToDelete.length > 0) {
          const { error: optDelError } = await supabase
            .from('options')
            .delete()
            .in('id', optionsToDelete)

          if (optDelError) throw optDelError
        }

        for (const o of q.options) {
          if (o.id) {
            const { error: optUpdateError } = await supabase
              .from('options')
              .update({ text: o.text })
              .eq('id', o.id)

            if (optUpdateError) throw optUpdateError
          } else {
            const { error: optInsertError } = await supabase
              .from('options')
              .insert([{ question_id: questionId, text: o.text }])

            if (optInsertError) throw optInsertError
          }
        }
      }

      setSuccess(true)
      if (onSave) onSave()
    } catch (e) {
      console.error(e)
      setError('Kaydetme sırasında hata oluştu.')
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
        value={title?? ''}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Quiz başlığı"
      />

      <label className="block mb-2 font-semibold">Dönem (opsiyonel)</label>
      <select
        value={termId ?? ''}
        onChange={e => setTermId(e.target.value || null)}
        className="w-full p-2 border rounded mb-6"
      >
        <option value="">Dönem seçin</option>
        {terms.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div>
        <h3 className="text-xl font-semibold mb-4">Sorular</h3>

        {questions.map((q, qIndex) => (
          <div key={q.id || qIndex} className="mb-6 border p-4 rounded bg-gray-50">
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
              value={q.text?? ''}
              onChange={e => updateQuestionText(qIndex, e.target.value)}
              placeholder="Soru metni"
              className="w-full p-2 border rounded mb-2"
            />

            <input
              type="number"
              min={0}
              max={100}
              value={q.score?? 0}
              onChange={e => updateQuestionscore(qIndex, parseInt(e.target.value) || 0)}
              placeholder="Puan (0-100)"
              className="w-24 p-2 border rounded mb-4"
            />

            <div>
              <label className="font-semibold mb-1 block">Seçenekler</label>

              {q.options.map((opt, oIndex) => (
                <div key={opt.id || oIndex} className="flex items-center mb-2 space-x-2">
                  <input
                    type="text"
                    value={opt.text ?? ''}
                    onChange={e => updateOptionText(qIndex, oIndex, e.target.value)}
                    placeholder="Seçenek metni"
                    className="flex-grow p-2 border rounded"
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
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  )
}
