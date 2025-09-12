'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuizQuestion from './QuizQuestion'
import QuizResult from './QuizResult'

type Option = {
  id: string
  text: string
  is_correct: boolean
}

type Question = {
  id: string
  text: string
  points: number
  options: Option[]
}

type Props = {
  questions: Question[]
}

export default function QuizFlow({ questions }: Props) {
  if(questions.length === 0) {
    return <p className="text-sm text-gray-500">No questions available for this quiz.</p>
  }
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const handleNext = (points: number) => {
    setScore((prev) => prev + points)
    if (index + 1 < questions.length) {
      setIndex(index + 1)
    } else {
      setFinished(true)
    }
  }

  const handleRetry = () => {
    setIndex(0)
    setScore(0)
    setFinished(false)
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (finished) {
    const total = questions.reduce((sum, q) => sum + q.points, 0)

    return (
      <QuizResult
        score={score}
        total={total}
        onRetry={handleRetry}
        onHome={handleGoHome}
      />
    )
  }

  return (
    <QuizQuestion
      key={questions[index]?.id}
      question={questions[index]}
      onNext={handleNext}
      isLast={index === questions.length - 1}
    />
  )
}
