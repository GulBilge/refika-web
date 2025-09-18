'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserWithRole } from '@/lib/getUserWithRole'
import { AcademicCapIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import DashboardCard from '@/components/ui/DashboardCard'
import { redirect } from 'next/navigation'

export default function Home() {
  const [role, setRole] = useState<string | null>(null)
  const [term_id, setTermId] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ name: string; termName: string } | null>(null)
  useEffect(() => {
    getUserWithRole().then((user) => {
      console.log('User with role:', user)
      if (user){
         setRole(user.role)
         setTermId(user.termId)
          setUserInfo({
            name: user.name || 'Kullanıcı',
            termName: user.termName || 'Dönem Seçilmemiş'
          })
        } else {
          redirect('/login')
        }
        if (user && !user.termId) {
          console.log('Kullanıcı dönem seçmemiş, yönlendiriliyor...')
           if (!user.termId) {
            redirect('/select-term')
          }
        }
    })
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">Refika’ya Hoş Geldin 🌸</h1>
    <div className="flex space-x-4">
        {role === 'admin' && (
          <Link
            href="/admin"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Yönetim Paneli
          </Link>
        )}
      </div>
    {term_id && userInfo && (
      <>
        <div className="text-sm text-gray-600 p-2 border rounded-xl inline-block">
          👋 {userInfo.name} | 📘 {userInfo.termName}
        </div>
        <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto">
          <DashboardCard
            title="Sınavlar"
            description="Dönemine ait sınavlara ulaş ve bilgini sınavla."
            href="/quizzes"
            icon={<AcademicCapIcon className="w-12 h-12 text-purple-600" />} />
          <DashboardCard
            title="Eşleştirmeler"
            description="Dönemine ait eşleştirme oyunlarıyla pratik yap."
            href="/matches"
            icon={<PuzzlePieceIcon className="w-12 h-12 text-purple-600" />} />
        </div>
      </>
    )}
    </main>
  )
}
