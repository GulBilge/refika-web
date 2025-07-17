'use client'

import { useEffect, useState } from 'react'
import { toast } from './ui/toast';

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
}

export default function Toast({ duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true)
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  useEffect(() => {
    toast._register((msg, type = 'success', duration = 3000) => {
      setVisible(false); // varsa kapat
      setTimeout(() => {
        setType(type);
        setMessage(msg);
        setVisible(true);
        setTimeout(() => setVisible(false), duration);
      }, 50); // küçük bekleme
    });
  }, []);


  if (!visible) return null

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`}>
      <div
        className={`px-4 py-2 rounded shadow-md text-white ${
          type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {message}
      </div>
    </div>
  )
}
