'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserWithRole } from '@/lib/getUserWithRole'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    getUserWithRole().then((user) => {
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
      <div className="flex space-x-4">
        <Link href="/quiz">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
            Quiz'e Başla
          </Button>
        </Link>

        <Link href="/matching">
          <Button variant="secondary">
            Eşleştirmeye Başla
          </Button>
        </Link>
      </div>
    </main>
  )
}
