'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setMessage(error.message)
      else  {
        setMessage('Giriş başarılı!')
        // Yönlendirme
        setTimeout(() => router.push('/'), 500)
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'student', // kullanıcıya varsayılan rol
          },
        },
      })
      if (error) setMessage(error.message)
      else  {
        setMessage('Kayıt başarılı, lütfen emailini onayla. Giriş sayfasına yönlendiriliyorsun.')
        // Kayıt sonrası login sayfasına yönlendirme
        setTimeout(() => router.push('/login'), 3000)
      }   
     }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded-xl mt-10 shadow-md">
      <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          required
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'İşleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-blue-600 text-center cursor-pointer"
        >
          {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
        </p>
        {message && <p className="text-center text-red-600">{message}</p>}
      </form>
    </div>
  )
}
