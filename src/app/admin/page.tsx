'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { getUserWithRole } from '@/lib/getUserWithRole'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [stats, setStats] = useState({
    termCount: 0,
    quizCount: 0,
    matchCount: 0,
    userCount: 0,
  })

  useEffect(() => {
    async function checkRoleAndFetch() {
      const user = await getUserWithRole()
      if (!user || user.role !== 'admin') {
        router.push('/login')
        return
      }
      setLoading(false)

      const [term, quiz, match, users] = await Promise.all([
        supabase.from('terms').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }).eq("activity_type", "quiz"),
        supabase.from('activities').select('*', { count: 'exact', head: true }).eq("activity_type", "matching"),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        termCount: term.count || 0,
        quizCount: quiz.count || 0,
        matchCount: match.count || 0,
        userCount: users.count || 0,
      })
    }

    checkRoleAndFetch()
  }, [router])

  if (loading) {
    return <p className="p-6 text-center">Yükleniyor...</p>
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
      </header>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Dönemler" count={stats.termCount} />
        <StatCard label="Quizler" count={stats.quizCount} />
        <StatCard label="Eşleştirme" count={stats.matchCount} />
        <StatCard label="Öğrenciler" count={stats.userCount} />
      </div>

      {/* Hızlı Erişim Linkleri */}
      <ul className="space-y-3">
        <LinkItem href="/admin/terms" label="📘 Dönemleri Yönet" />
        <LinkItem href="/admin/quizzes" label="📋 Quizleri Yönet" />
        <LinkItem href="/admin/matches" label="🧩 Eşleştirme Oyunları" />
        <LinkItem href="/admin/users" label="👥 Öğrenci Listesi" />
      </ul>
    </main>
  )
}

function StatCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 text-center border">
      <div className="text-2xl font-bold text-indigo-600">{count}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function LinkItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="block w-full bg-indigo-50 hover:bg-indigo-100 transition px-4 py-3 rounded-xl text-indigo-800 font-medium"
      >
        {label}
      </Link>
    </li>
  )
}
