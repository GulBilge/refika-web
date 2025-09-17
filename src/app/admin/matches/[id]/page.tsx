'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { toast } from '@/components/ui/toast'
import { v4 as uuidv4 } from 'uuid'

// Tip tanımları
type MatchingPair = {
  id: string
  left_text: string,
  right_text: string,
  isNew?: boolean
}

type Term = {
  id: string
  name: string
}

export default function MatchingEditPage() {
  const { id: matchingId } = useParams() as { id: string }
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [termId, setTermId] = useState<string | null>(null)
  const [matching_pairs, setMatchingPairs] = useState<MatchingPair[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Veri yükleme işlemi
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const { data: matchingData, error: matchingError } = await supabase
          .from('activities')
          .select(`
            id,
            title,
            term_id,
            matching_pairs (
              id,
              left_text,
              right_text
            )
          `)
          .eq('id', matchingId)
          .single()

        if (matchingError) throw matchingError

        const { data: termData, error: termError } = await supabase.from('terms').select('id, name')
        if (termError) throw termError
        setTerms(termData)

        setTitle(matchingData.title)
        setTermId(matchingData.term_id)
        setMatchingPairs(matchingData.matching_pairs.map((p: any) => ({
          ...p,
          isNew: false
        })))
      } catch (e: any) {
        toast.error('Veri yüklenirken hata oluştu: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [matchingId])

  const handleAddMatchingPair = useCallback(() => {
    setMatchingPairs((prev) => [
      ...prev,
      {
        id: uuidv4(),
        left_text: '',
        right_text: '',
      },
    ])
  }, [])

  const handleRemoveMatchingPair = useCallback((idToRemove: string) => {
    setMatchingPairs((prev) => prev.filter((p) => p.id !== idToRemove))
  }, [])


  const handleMatchingPairChange = useCallback((id: string, field: string, value: any) => {
    setMatchingPairs((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
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

      for (const p of matching_pairs) {
        if (!p.left_text.trim() || !p.right_text.trim()) {
          toast.error('Tüm eşleştirme çiftleri doldurulmalıdır.')
          setSaving(false)
          return
        }
      }

      // 2. Eşleştirmeyi Güncelle
      const { error: matchingError } = await supabase
        .from('activities')
        .update({ title, term_id: termId })
        .eq('id', matchingId)
      if (matchingError) throw matchingError

      // 3. Mevcut ve Yeni eşleştirmeleri ayır
      const existingMatchingPairs = matching_pairs.filter(q => !q.isNew)
      const newMatchingPairs = matching_pairs.filter(q => q.isNew)

      // 4. Eşleştirmeleri silme: mevcut DB eşleştirmelerinden, formda olmayanları sil
      const { data: dbMatchingPairs } = await supabase.from('matching_pairs').select('id').eq('game_id', matchingId)
      const existingMatchingPairIds = dbMatchingPairs?.map(p => p.id) || []
      const currentMatchingPairIds = existingMatchingPairs.map(p => p.id)
      const matchingPairToDelete = existingMatchingPairIds.filter(id => !currentMatchingPairIds.includes(id))

      if (matchingPairToDelete.length > 0) {
        await supabase.from('matching_pairs').delete().in('id', matchingPairToDelete)
      }

      // 5. Yeni eşleştirmeleri kaydet
      const matchingPairsToInsert = newMatchingPairs.map(p => ({
        qame_id: matchingId,
        left_text: p.left_text,
        right_text: p.right_text
      }))

      if (matchingPairsToInsert.length > 0) {
        const { data: insertedMatchingPairs, error } = await supabase
          .from('matching_pairs')
          .insert(matchingPairsToInsert)
          .select('id')
        if (error) throw error
      }

      // 6. Mevcut eşleştirmeleri güncelle
      for (const p of existingMatchingPairs) {
        await supabase.from('matching_pairs').update({ left_text: p.left_text, right_text: p.right_text }).eq('id', p.id)
      }

      toast.success('Eşleştirme Oyunu başarıyla güncellendi! 🎉')
      router.push('/admin/matches')

    } catch (e: any) {
      console.error(e)
      toast.error('Kaydetme sırasında bir hata oluştu: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-lg mt-8">Yükleniyor...</p>

  //... (Mevcut fonksiyon ve state tanımları)

return (
  <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">

      {/* Başlık ve Geri Butonu */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition-colors mr-4"
          aria-label="Geri Dön"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Eşleştirme Oyununu Düzenle</h1>
      </div>

      {loading ? (
        <p className="text-center text-lg mt-8 text-gray-600">Yükleniyor...</p>
      ) : (
        <>
          {/* Form Alanları */}
          <div className="space-y-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                type="text"
                id="title"
                placeholder="Eşleştirme Oyunu Başlığı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Dönem</label>
              <select
                id="term"
                value={termId ?? ''}
                onChange={(e) => setTermId(e.target.value || null)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all px-3 py-2"
              >
                <option value="">Dönem Seç</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Eşleştirme Çiftleri */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Eşleştirme Çiftleri</h3>
            {matching_pairs.map((p, pIndex) => (
              <div key={p.id} className="relative bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleRemoveMatchingPair(p.id)}
                    className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                    aria-label="Bu eşleştirme çiftini sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label htmlFor={`left-text-${p.id}`} className="block text-sm font-medium text-gray-500 mb-1">Sol Metin</label>
                    <input
                      type="text"
                      id={`left-text-${p.id}`}
                      placeholder="Sol metni girin"
                      value={p.left_text}
                      onChange={(e) => handleMatchingPairChange(p.id, 'left_text', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor={`right-text-${p.id}`} className="block text-sm font-medium text-gray-500 mb-1">Sağ Metin</label>
                    <input
                      type="text"
                      id={`right-text-${p.id}`}
                      placeholder="Sağ metni girin"
                      value={p.right_text}
                      onChange={(e) => handleMatchingPairChange(p.id, 'right_text', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={handleAddMatchingPair}
              className="w-full text-center py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors"
            >
              + Yeni Eşleştirme Çifti Ekle
            </button>
          </div>
        </>
      )}

      {/* Kaydet Butonu - Sayfanın altında sabit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-top">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>

    </div>
  </div>
)
}