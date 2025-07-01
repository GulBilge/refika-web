// src/components/QuizOptions.tsx
'use client'  // bu satır Client Component olduğunu belirtir

type Option = {
  id: string
  option_text: string  
  is_correct: boolean
}
interface QuizOptionsProps {
  options: Option[]
}

export default function QuizOptions({ options }: QuizOptionsProps) {
  return (
    <ul>
      {options.map((option) => (
        <li
          key={option.id}
          onClick={() => console.log('Selected:', option.option_text)}
          className="p-4 border rounded-xl hover:bg-indigo-50 cursor-pointer transition"
        >
          {option.option_text}
        </li>
      ))}
    </ul>
  )
}
