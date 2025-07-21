'use client'

import { useState } from 'react'

type Option = {
  id: string
  text: string
  is_correct: boolean
}

type Question = {
  id: string
  text: string
  options: Option[]
  points: number
}

type Props = {
  question: Question
  isLast: boolean
  onNext: (score: number) => void
}

export default function QuizQuestion({ question, isLast, onNext }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleOptionClick = (option: Option) => {
    if (showAnswer) return
    setSelectedId(option.id)
    setShowAnswer(true)
  }

  const handleNext = () => {
    const selected = question.options.find(opt => opt.id === selectedId)
    const score = selected?.is_correct ? question.points : 0
    setSelectedId(null)
    setShowAnswer(false)
    onNext(score)
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-center">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map(option => {
          const isSelected = selectedId === option.id
          const isCorrect = option.is_correct
          const showFeedback = showAnswer && (isSelected || isCorrect)

          let bgColor = 'border border-gray-300 hover:bg-gray-100'
          if (showAnswer) {
            if (isSelected && isCorrect) bgColor = 'bg-green-500 text-white border border-green-600'
            else if (isSelected && !isCorrect) bgColor = 'bg-red-500 text-white border border-red-600'
            else if (!isSelected && isCorrect) bgColor = 'bg-green-100 border border-green-400 text-green-800'
          }

          return (
            <div key={option.id}>
              <button
                onClick={() => handleOptionClick(option)}
                className={`w-full p-3 rounded-xl text-left transition duration-200 ${bgColor}`}
              >
                {option.text}
              </button>

              {showFeedback && (
                <p className={`mt-1 text-sm ${
                  isSelected && isCorrect
                    ? 'text-green-700'
                    : isSelected && !isCorrect
                    ? 'text-red-600'
                    : !isSelected && isCorrect
                    ? 'text-green-600'
                    : ''
                }`}>
                  {isSelected && isCorrect && '✔️ Tebrikler, doğru cevap!'}
                  {isSelected && !isCorrect && '❌ Bu cevap yanlış.'}
                  {!isSelected && isCorrect && '✅ Doğru cevap bu olmalıydı.'}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {showAnswer && (
        <button
          onClick={handleNext}
          className="w-full py-4 text-lg font-medium bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          {isLast ? '🎯 Sınavı Bitir' : '➡️ Sonraki'}
        </button>
      )}
    </div>
  )
}
