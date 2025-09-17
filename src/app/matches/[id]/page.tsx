// pages/matching.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { easeInOut } from "framer-motion";
import { useParams } from "next/navigation";
import { toast } from '@/components/ui/toast'
import { supabase } from '@/utils/supabase/client';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type MatchingPair = { id: string; left_text: string; right_text: string; game_id?: string };

const SET_SIZE = 5;
const SHAKE_DURATION = 400; // Sihirli sayıları sabit değişkenlere çevirelim
const NEXT_SET_DELAY = 600;

const shuffleArray = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

export default function Matching() {
  const { id: matchingId } = useParams() as { id: string };
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingPairs, setRemainingPairs] = useState<MatchingPair[]>([]);
  const [currentSet, setCurrentSet] = useState<MatchingPair[]>([]);
  const [currentLeftSet, setCurrentLeftSet] = useState<MatchingPair[]>([]);
  const [currentRightSet, setCurrentRightSet] = useState<MatchingPair[]>([]);
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [particles, setParticles] = useState<{ id: string; x: number; y: number }[]>([]);

  useEffect(() => {
    // URL'deki ID değiştiğinde veriyi tekrar çekmek için loadData'yı çağır
    if (matchingId) {
      loadData();
    }
  }, [matchingId]);

  useEffect(() => {
    // matchingPairs verisi geldiğinde oyunu başlat
    if (matchingPairs.length > 0) {
      startNewGame();
    }
  }, [matchingPairs]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: matchingData, error: matchingError } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          matching_pairs (
            id,
            left_text,
            right_text
          )
        `)
        .eq('id', matchingId)
        .single();

      if (matchingError) throw matchingError;

      // Supabase'den gelen veriye game_id eklemeye gerek yok,
      // çünkü zaten üst seviye `activities` tablosundan geliyor.
      const pairs = matchingData.matching_pairs.map((p: any) => ({
        id: p.id,
        left_text: p.left_text,
        right_text: p.right_text,
      }));
      setMatchingPairs(pairs);
    } catch (e: any) {
      toast.error('Veri yüklenirken bir hata oluştu: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const getParticleCount = () => {
    if (typeof window === 'undefined') return 0; // Sunucu tarafı render için kontrol
    if (window.innerWidth < 640) return 3;
    if (window.innerWidth < 1024) return 5;
    return 8;
  };

  const spawnParticles = (id: string) => {
    const count = getParticleCount();
    const newParticles = Array.from({ length: count }).map((_, idx) => ({
      id: id + "-" + idx,
      x: Math.random() * 40 - 20,
      y: Math.random() * -40 - 20,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), NEXT_SET_DELAY);
  };

  const startNewGame = () => {
    const shuffled = shuffleArray(matchingPairs);
    setRemainingPairs(shuffled);
    setMatched([]);
    setLeftSelected(null);
    setGameOver(false);
    setShake(false);
    setCompletedCount(0);
    setParticles([]);
    loadNextSet(shuffled);
  };

  const loadNextSet = (pairs: MatchingPair[]) => {
    const nextSet = pairs.slice(0, SET_SIZE);
    const nextLeftSet = shuffleArray(nextSet);
    const nextRightSet = shuffleArray(nextSet);

    setCurrentSet(nextSet);
    setRemainingPairs(pairs.slice(SET_SIZE));
    setCurrentLeftSet(nextLeftSet);
    setCurrentRightSet(nextRightSet);
    setMatched([]);
    setLeftSelected(null);
  };

  const handleClick = (side: "left" | "right", id: string) => {
    if (gameOver || matched.includes(id)) return; // Maçlanmış kutulara tıklamayı engelle

    if (side === "left") {
      setLeftSelected(id);
    } else if (side === "right" && leftSelected) {
      const leftPair = currentSet.find((p) => p.id === leftSelected);
      const rightPair = currentSet.find((p) => p.id === id);

      if (leftPair?.id === rightPair?.id) {
        const newMatched = [...matched, leftSelected];
        setMatched(newMatched);
        setLeftSelected(null);
        setCompletedCount((prev) => prev + 1);

        spawnParticles(leftSelected);

        if (newMatched.length === currentSet.length) {
          if (remainingPairs.length > 0) {
            setTimeout(() => loadNextSet(remainingPairs), NEXT_SET_DELAY);
          } else {
            setTimeout(() => setGameOver(true), NEXT_SET_DELAY); // Tüm eşleşmeler bitince oyunu sonlandır
          }
        }
      } else {
        setShake(true);
        setTimeout(() => {
          setShake(false); // Titreşimi sıfırla
          setGameOver(true);
        }, SHAKE_DURATION);
      }
    }
  };

  const boxAnimation = (p: MatchingPair, side: "left" | "right") => ({
    opacity: 1,
    y: 0,
    scale: matched.includes(p.id) ? 1.05 : 1,
    boxShadow: matched.includes(p.id)
      ? "0 0 12px 4px #34d399"
      : "0 0 0px 0px transparent",
    backgroundColor: matched.includes(p.id)
      ? "#d1fae5"
      : leftSelected === p.id && side === "left"
      ? "#fef08a"
      : "#ffffff",
  });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeInOut } },
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const finalScore = completedCount;
  const totalPairs = matchingPairs.length;
  const isAllMatched = finalScore === totalPairs;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative">
      <h1 className="text-2xl font-bold mb-2">Eşleştirme Oyunu</h1>
      <p className="mb-4 font-medium text-gray-700">
        Doğru: {completedCount} / {matchingPairs.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSet.map((p) => p.id).join(",")}
          className="grid grid-cols-2 gap-4 w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={
            shake
              ? { x: [0, -6, 6, -6, 6, 0] }
              : { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeInOut" } }
          }
          exit={{ x: -100, opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        >
          {/* Sol Sütun */}
          <motion.div className="flex flex-col gap-2">
            {currentLeftSet.map((p) => (
              <motion.div
                key={p.id}
                layout
                onClick={() => handleClick("left", p.id)}
                animate={boxAnimation(p, "left")}
                className="p-4 rounded-md cursor-pointer text-center border border-gray-300 shadow-sm relative break-words overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="whitespace-normal">{p.left_text}</span>
                {matched.includes(p.id) && (
                  <span className="absolute top-1 right-1 text-green-600 font-bold">✔</span>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Sağ Sütun */}
          <motion.div className="flex flex-col gap-2">
            {currentRightSet.map((p) => (
              <motion.div
                key={p.id}
                layout
                onClick={() => handleClick("right", p.id)}
                animate={boxAnimation(p, "right")}
                className="p-4 rounded-md cursor-pointer text-center border border-gray-300 shadow-sm relative break-words overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="whitespace-normal">{p.right_text}</span>
                {matched.includes(p.id) && (
                  <span className="absolute top-1 right-1 text-green-600 font-bold">✔</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Particle Confetti */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-green-400 rounded-full"
        />
      ))}

      {(gameOver || isAllMatched) && (
        <div className="mt-6 text-center">
          {isAllMatched ? (
            <p className="text-green-500 font-semibold mb-3">Tebrikler! Tüm eşleşmeleri tamamladınız.</p>
          ) : (
            <p className="text-red-500 font-semibold mb-3">Yanlış eşleştirme! Tekrar deneyin.</p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={startNewGame}
              className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition"
            >
              Tekrar Oyna
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 bg-gray-400 text-white rounded-md shadow-sm hover:bg-gray-500 transition"
            >
              Anasayfa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}