'use client';

import { useRouter } from 'next/navigation';

export default function BackToHomeButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/')}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
    >
      Anasayfa
    </button>
  );
}
