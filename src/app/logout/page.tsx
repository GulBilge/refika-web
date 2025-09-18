'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogout = async () => {
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage('Çıkış yaparken bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Logout error:', error)
      setLoading(false)
    } else {
      setMessage('Başarıyla çıkış yapıldı. Yönlendiriliyorsunuz...')
      router.push('/')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Çıkış Yap</h2>
        <p className="mb-6 text-gray-600">Hesabınızdan çıkış yapmak istediğinizden emin misiniz?</p>
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`w-full py-2 px-4 rounded transition-colors ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {loading ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
        </button>
        {message && (
          <p className={`mt-4 text-sm ${message.includes('hata') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}