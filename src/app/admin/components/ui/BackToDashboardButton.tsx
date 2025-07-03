'use client';

import { useRouter } from 'next/navigation';

export default function BackToDashboardButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/admin')}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
    >
      Yönetim Paneli
    </button>
  );
}
