'use client'

import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import HCaptcha from '@hcaptcha/react-hcaptcha'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('') // Yeni: Ad Soyad durumu eklendi.
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | undefined>()
  const router = useRouter()
  const captcha = useRef<HCaptcha | null>(null)

  useEffect(() => {
    setMessage(null)
  }, [captchaToken, isLogin])

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return 'Şifreniz en az 8 karakter uzunluğunda olmalıdır.'
    }
    if (!hasUpperCase) {
      return 'Şifreniz en az bir büyük harf içermelidir.'
    }
    if (!hasLowerCase) {
      return 'Şifreniz en az bir küçük harf içermelidir.'
    }
    if (!hasNumber) {
      return 'Şifreniz en az bir rakam içermelidir.'
    }
    if (!hasSpecialChar) {
      return 'Şifreniz en az bir özel karakter (!@#$%^&*) içermelidir.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!captchaToken) {
      setMessage('Lütfen robot olmadığınızı doğrulayın.')
      setLoading(false)
      return
    }

    if (!isLogin) {
      const passwordError = validatePassword(password)
      if (passwordError) {
        setMessage(passwordError)
        setLoading(false)
        return
      }
      // Yeni: Kayıt formunda ad soyadın boş olup olmadığını kontrol et.
      if (!fullName.trim()) {
        setMessage('Lütfen adınızı ve soyadınızı girin.')
        setLoading(false)
        return
      }
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setMessage('Giriş başarısız. Lütfen e-posta veya şifrenizi kontrol edin.')
      } else {
        setMessage('Giriş başarılı! Yönlendiriliyorsunuz...')
        router.push('/')
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'student',
            fullName, // Yeni: Ad Soyad bilgisini Supabase'e gönder.
          },
          captchaToken,
        },
      })
      if (error) {
        setMessage('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.')
      } else {
        if (captcha.current) {
          captcha.current.resetCaptcha()
        }
        setMessage('Kayıt başarılı! Lütfen gelen kutunuzu kontrol ederek e-posta adresinizi onaylayın.')
      }
    }

    setLoading(false)
  }

  const handleToggle = () => {
    setIsLogin(!isLogin)
    setMessage(null)
    setEmail('')
    setPassword('')
    setFullName('') // Yeni: Ad Soyad durumunu temizle.
    if (captcha.current) {
      captcha.current.resetCaptcha()
    }
    setCaptchaToken(undefined)
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded-xl mt-10 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && ( // Kayıt formunda Ad Soyad alanını göster.
          <input
            type="text"
            required
            placeholder="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        )}
        <input
          type="email"
          required
          placeholder="E-posta Adresi"
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
        <HCaptcha
          ref={captcha}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
          onVerify={(token) => {
            setCaptchaToken(token)
          }}
          onExpire={() => {
            setCaptchaToken(undefined)
          }}
        />
        <button
          type="submit"
          disabled={loading || !captchaToken}
          className={`w-full text-white py-2 rounded ${loading || !captchaToken ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'İşleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>
        <p
          onClick={handleToggle}
          className="text-sm text-blue-600 text-center cursor-pointer"
        >
          {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
        </p>
        {message && <p className={`text-center ${message.includes('başarısız') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
      </form>
    </div>
  )
}