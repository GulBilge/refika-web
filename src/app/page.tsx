'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserWithRole } from '@/lib/getUserWithRole'
import { AcademicCapIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import DashboardCard from '@/components/ui/DashboardCard'

export default function Home() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    getUserWithRole().then((user) => {
      console.log('User with role:', user)
      if (user) setRole(user.role)
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
      <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto">
      <DashboardCard
        title="Quizler"
        description="Dönemine ait quizlere ulaş ve bilgini sınavla."
        href="/quiz"
        icon={<AcademicCapIcon className="w-12 h-12 text-purple-600" />}
      />
      <DashboardCard
        title="Eşleştirmeler"
        description="Dönemine ait eşleştirme oyunlarıyla pratik yap."
        href="/matches"
        icon={<PuzzlePieceIcon className="w-12 h-12 text-purple-600" />}
      />
      </div>
    </main>
  )
}
