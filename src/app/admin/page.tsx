'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    termCount: 0,
    quizCount: 0,
    matchCount: 0,
    userCount: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const [term, quiz, match, users] = await Promise.all([
        supabase.from('terms').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('matching_games').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        termCount: term.count || 0,
        quizCount: quiz.count || 0,
        matchCount: match.count || 0,
        userCount: users.count || 0,
      })
    }

    fetchStats()
  }, [])

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Dönemler" count={stats.termCount} />
        <StatCard label="Quizler" count={stats.quizCount} />
        <StatCard label="Eşleştirme" count={stats.matchCount} />
        <StatCard label="Öğrenciler" count={stats.userCount} />
      </div>

      {/* Hızlı Erişim Linkleri */}
      <h2 className="text-xl font-semibold mb-4">Yönetim Panelleri</h2>
      <ul className="space-y-3">
        <LinkItem href="/admin/terms" label="📘 Dönemleri Yönet" />
        <LinkItem href="/admin/quizzes" label="📋 Quizleri Yönet" />
        <LinkItem href="/admin/matching-games" label="🧩 Eşleştirme Oyunları" />
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
  );
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
