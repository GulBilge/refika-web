// app/select-term/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SelectTermPage() {
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([])
  const [selectedTerm, setSelectedTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchTerms() {
      const { data, error } = await supabase.from('terms').select('id, name')
      if (error) setError('Dönemler yüklenemedi')
      else setTerms(data || [])
      setLoading(false)
    }

    fetchTerms()
  }, [])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!selectedTerm) return

  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    router.push('/login')
    return
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ term_id: selectedTerm })
    .eq('id', userData.user.id)

  if (updateError) {
    setError('Dönem kaydedilemedi.')
  } else {
    setTimeout(() => {
      router.replace('/')
    }, 200)
  }
}

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Dönem Seçimi</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          >
            <option value="">Dönem Seç</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Kaydet ve Devam Et
          </button>
          {error && <p className="text-red-600">{error}</p>}
        </form>
      )}
    </div>
  )
}
