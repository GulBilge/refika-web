// src/components/QuizOptions.tsx
'use client'  // bu satır Client Component olduğunu belirtir

interface Option {
  id: number
  text: string
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
          onClick={() => console.log('Selected:', option.text)}
          className="p-4 border rounded-xl hover:bg-indigo-50 cursor-pointer transition"
        >
          {option.text}
        </li>
      ))}
    </ul>
  )
}
