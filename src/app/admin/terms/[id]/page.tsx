'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'

export default function TermDetailPage() {
  const { id: termId } = useParams() as { id: string }

  const [termName, setTermName] = useState('')
  const [activeTab, setActiveTab] = useState<'quiz' | 'match'>('quiz')

  const [quizzes, setQuizzes] = useState<any[]>([])
  const [matchings, setMatchings] = useState<any[]>([])
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([])
  const [availableMatches, setAvailableMatches] = useState<any[]>([])

  const [selectedQuizId, setSelectedQuizId] = useState('')
  const [selectedMatchId, setSelectedMatchId] = useState('')

  useEffect(() => {
    fetchTerm()
    fetchAll()
  }, [termId])

  async function fetchTerm() {
    const { data } = await supabase.from('terms').select('name').eq('id', termId).single()
    if (data) setTermName(data.name)
  }

  async function fetchAll() {
    fetchTermQuizzes()
    fetchAvailableQuizzes()
    fetchTermMatches()
    fetchAvailableMatches()
  }

  // QUIZ
  async function fetchTermQuizzes() {
    const { data } = await supabase.from('quizzes').select('id, question').eq('term_id', termId)
    setQuizzes(data || [])
  }

  async function fetchAvailableQuizzes() {
    const { data } = await supabase.from('quizzes').select('id, question').is('term_id', null)
    setAvailableQuizzes(data || [])
  }

  async function handleAddQuiz() {
    if (!selectedQuizId) return
    await supabase.from('quizzes').update({ term_id: termId }).eq('id', selectedQuizId)
    setSelectedQuizId('')
    fetchAll()
  }

  async function handleRemoveQuiz(id: string) {
    await supabase.from('quizzes').update({ term_id: null }).eq('id', id)
    fetchAll()
  }

  // MATCHING
  async function fetchTermMatches() {
    const { data } = await supabase.from('matching_games').select('id, title').eq('term_id', termId)
    setMatchings(data || [])
  }

  async function fetchAvailableMatches() {
    const { data } = await supabase.from('matching_games').select('id, title').is('term_id', null)
    setAvailableMatches(data || [])
  }

  async function handleAddMatch() {
    if (!selectedMatchId) return
    await supabase.from('matching_games').update({ term_id: termId }).eq('id', selectedMatchId)
    setSelectedMatchId('')
    fetchAll()
  }

  async function handleRemoveMatch(id: string) {
    await supabase.from('matching_games').update({ term_id: null }).eq('id', id)
    fetchAll()
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📘 {termName}</h1>

      {/* Tab Menüsü */}
      <div className="border-b mb-6 flex gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`pb-2 ${activeTab === 'quiz' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Quizler
        </button>
        <button
          onClick={() => setActiveTab('match')}
          className={`pb-2 ${activeTab === 'match' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Eşleştirme Oyunları
        </button>
      </div>

      {activeTab === 'quiz' && (
        <>
          <ul className="space-y-4 mb-6">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="border p-4 rounded-xl flex justify-between">
                <div>
                  <p className="font-semibold">{quiz.question}</p>
                  <Link href={`/admin/quizzes/${quiz.id}`} className="text-sm text-indigo-600 underline">
                    Quiz detay sayfası
                  </Link>
                </div>
                <button onClick={() => handleRemoveQuiz(quiz.id)} className="text-red-500 text-sm">Çıkar</button>
              </li>
            ))}
          </ul>

          {/* Quiz ekleme */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Quiz Ekle</h2>
            <div className="flex gap-2">
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="border px-4 py-2 rounded-xl w-full"
              >
                <option value="">Bir quiz seçin</option>
                {availableQuizzes.map((q) => (
                  <option key={q.id} value={q.id}>{q.question}</option>
                ))}
              </select>
              <button onClick={handleAddQuiz} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">Ekle</button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'match' && (
        <>
          <ul className="space-y-4 mb-6">
            {matchings.map((game) => (
              <li key={game.id} className="border p-4 rounded-xl flex justify-between">
                <div>
                  <p className="font-semibold">{game.title}</p>
                  <Link href={`/admin/matching-games/${game.id}`} className="text-sm text-indigo-600 underline">
                    Oyun detay sayfası
                  </Link>
                </div>
                <button onClick={() => handleRemoveMatch(game.id)} className="text-red-500 text-sm">Çıkar</button>
              </li>
            ))}
          </ul>

          {/* Eşleştirme ekleme */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Eşleştirme Ekle</h2>
            <div className="flex gap-2">
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="border px-4 py-2 rounded-xl w-full"
              >
                <option value="">Bir oyun seçin</option>
                {availableMatches.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              <button onClick={handleAddMatch} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">Ekle</button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
