'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Term = {
  id: string
  name: string
}

export default function TermListPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [newTerm, setNewTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTerms()
  }, [])

  async function fetchTerms() {
    const { data, error } = await supabase.from('terms').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Term fetch error:', error)
    } else {
      setTerms(data || [])
    }
  }

  async function handleAddTerm() {
    if (!newTerm.trim()) return
    setLoading(true)
    const { error } = await supabase.from('terms').insert({ name: newTerm })
    if (!error) {
      setNewTerm('')
      fetchTerms()
    }
    setLoading(false)
  }

  async function handleDeleteTerm(id: string) {
    if (!confirm('Bu dönemi silmek istediğinize emin misiniz?')) return
    await supabase.from('terms').delete().eq('id', id)
    fetchTerms()
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📘 Dönemler</h1>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={newTerm}
          onChange={(e) => setNewTerm(e.target.value)}
          placeholder="Yeni dönem adı..."
          className="border px-4 py-2 rounded-xl w-full"
        />
        <button
          onClick={handleAddTerm}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          Ekle
        </button>
      </div>

      <ul className="space-y-4">
        {terms.map((term) => (
          <li
            key={term.id}
            className="border p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{term.name}</p>
              <Link
                href={`/admin/terms/${term.id}`}
                className="text-sm text-indigo-600 underline"
              >
                Detay sayfası
              </Link>
            </div>
            <button
              onClick={() => handleDeleteTerm(term.id)}
              className="text-red-500 text-sm hover:underline"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
