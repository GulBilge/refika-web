import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">Refika’ya Hoş Geldin 🌸</h1>

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
