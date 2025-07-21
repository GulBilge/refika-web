'use client'

type Props = {
  score: number
  total: number
  onRetry: () => void
  onHome: () => void
}

export default function QuizResult({ score, total, onRetry, onHome }: Props) {
  return (
    <div className="p-6 space-y-6 text-center">
      <h2 className="text-2xl font-bold text-green-700">🎉 Sınav Tamamlandı</h2>

      <p className="text-lg">
        Toplam Puan: <span className="font-semibold">{score} / {total}</span>
      </p>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
        >
          🔄 Sınavı Tekrarla
        </button>

        <button
          onClick={onHome}
          className="w-full py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-900 transition"
        >
          🏠 Anasayfaya Dön
        </button>
      </div>
    </div>
  )
}
