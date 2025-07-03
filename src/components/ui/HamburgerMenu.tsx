'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Klavye ile ESC ile kapatma
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <nav className="bg-gray-800 text-white p-4 relative" ref={menuRef}>
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Uygulama</div>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          className="focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`mt-4 flex flex-col space-y-2 overflow-hidden transition-all duration-300 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <Link
          href="/"
          className="block px-3 py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
          onClick={() => setOpen(false)}
        >
          Ana Sayfa
        </Link>
        <Link
          href="/quizzes"
          className="block px-3 py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
          onClick={() => setOpen(false)}
        >
          Quizler
        </Link>
        <Link
          href="/matches"
          className="block px-3 py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
          onClick={() => setOpen(false)}
        >
          Eşleştirmeler
        </Link>
        <Link
          href="/select-term"
          className="block px-3 py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
          onClick={() => setOpen(false)}
        >
          Dönem Seçimi
        </Link>
        <Link
          href="/profile"
          className="block px-3 py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
          onClick={() => setOpen(false)}
        >
          Profil
        </Link>
        <Link
          href="/logout"
          className="block px-3 py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
          onClick={() => setOpen(false)}
        >
          Çıkış
        </Link>
      </div>
    </nav>
  );
}
