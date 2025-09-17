'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

type Matching = {
  id: string
  title: string
  created_at: string
  term_id: string | null
}

export default function MatchingListPage() {
  const [matches, setMatches] = useState<Matching[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, created_at, term_id')
      .eq('activity_type', 'matching')
      .order('created_at', { ascending: false })
    if (!error && data) setMatches(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Bu eşleştirme silinecek. Emin misiniz?')
    if (!confirm) return
    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (!error) {
      fetchMatches()
    }
  }

  return (
      <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Eşleştirmeler</h1>
        <Link
          href="/admin/matches/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Yeni Eşleştirme
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Eşleştirme Listesi</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((matching) => (
            <li
              key={matching.id}
              className="flex items-center justify-between p-4 bg-white border rounded-xl shadow"
            >
              <div>
                <h3 className="text-lg font-semibold">{matching.title}</h3>
                <p className="text-sm text-gray-500">
                  Oluşturulma: {new Date(matching.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/matches/${matching.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Detay
                </Link>
                <Button variant="destructive" onClick={() => handleDelete(matching.id)}>
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
