// pages/matching.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { easeInOut } from "framer-motion";

type Pair = { id: string; left_text: string; right_text: string; game_id: string };

const allPairs: Pair[] = [
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "1", left_text: "Apple", right_text: "Red" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "2", left_text: "Banana", right_text: "Yellow" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "3", left_text: "Grapes", right_text: "Purple" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "4", left_text: "Orange", right_text: "Orange" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "5", left_text: "Lemon", right_text: "Yellow" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "6", left_text: "Kiwi", right_text: "Green" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "7", left_text: "Strawberry", right_text: "Red" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "8", left_text: "Blueberry", right_text: "Blue" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "9", left_text: "Pear", right_text: "Green" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "10", left_text: "Peach", right_text: "Orange" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "11", left_text: "Cherry", right_text: "Red" },
  {game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70', id: "12", left_text: "Mango", right_text: "Yellow" },
];
// export const allPairs: Pair[] = [
//   {
//     id: '1',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Elma',
//     right_text: 'تفاح',
//   },
//   {
//     id: '2',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Muz',
//     right_text: 'موز',
//   },
//   {
//     id: '3',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Üzüm',
//     right_text: 'عنب',
//   },
//   {
//     id: '4',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Portakal',
//     right_text: 'برتقال',
//   },
//   {
//     id: '5',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Limon',
//     right_text: 'ليمون',
//   },
//   {
//     id: '6',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Kivi',
//     right_text: 'كيوي',
//   },
//   {
//     id: '7',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Çilek',
//     right_text: 'فراولة',
//   },
//   {
//     id: '8',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Yaban Mersini',
//     right_text: 'توت أزرق',
//   },
//   {
//     id: '9',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Armut',
//     right_text: 'كمثرى',
//   },
//   {
//     id: '10',
//     game_id: 'd75dabb8-4ea5-4981-8159-0974161d4a70',
//     left_text: 'Şeftali',
//     right_text: 'خوخ',
//   },
// ];

const SET_SIZE = 5;

const shuffleArray = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

export default function Matching() {
  const [remainingPairs, setRemainingPairs] = useState<Pair[]>([]);
  const [currentSet, setCurrentSet] = useState<Pair[]>([]);
  const [currentLeftSet, setCurrentLeftSet] = useState<Pair[]>([]);
  const [currentRightSet, setCurrentRightSet] = useState<Pair[]>([]);
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [particles, setParticles] = useState<{ id: string; x: number; y: number }[]>([]);

  useEffect(() => startNewGame(), []);

  const getParticleCount = () => {
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
    setTimeout(() => setParticles([]), 600);
  };

  const startNewGame = () => {
    const shuffled = shuffleArray(allPairs);
    setRemainingPairs(shuffled);
    setMatched([]);
    setLeftSelected(null);
    setGameOver(false);
    setShake(false);
    setCompletedCount(0);
    setParticles([]);
    loadNextSet(shuffled);
  };

  const loadNextSet = (pairs: Pair[]) => {
    const nextSet = pairs.slice(0, SET_SIZE);
    const nextLeftSet = shuffleArray(nextSet);
    const nextRightSet = shuffleArray(nextSet);

    setCurrentSet(nextSet);
    setCurrentLeftSet(nextLeftSet);
    setCurrentRightSet(nextRightSet);
    setRemainingPairs(pairs.slice(SET_SIZE));
    setMatched([]);
    setLeftSelected(null);
  };

  const handleClick = (side: "left" | "right", id: string) => {
    if (gameOver) return;

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
            setTimeout(() => loadNextSet(remainingPairs), 600);
          }
        }
      } else {
        setShake(true);
        setTimeout(() => setGameOver(true), 400);
      }
    }
  };

  const boxAnimation = (p: Pair, side: "left" | "right") => ({
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative">
      <h1 className="text-2xl font-bold mb-2">Matching Game</h1>
      <p className="mb-4 font-medium text-gray-700">
        Doğru: {completedCount} / {allPairs.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSet.map((p) => p.id).join(",")}
          className="grid grid-cols-2 gap-4 w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={
            shake
              ? { x: [0, -6, 6, -6, 6, 0], opacity: 1 }
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

      {(gameOver ||
        (remainingPairs.length === 0 && matched.length === currentSet.length)) && (
        <div className="mt-6 text-center">
          {gameOver ? (
            <p className="text-red-500 font-semibold mb-3">Yanlış eşleştirme! Tekrar deneyin.</p>
          ) : (
            <p className="text-green-500 font-semibold mb-3">
              Tebrikler! Tüm eşleşmeleri tamamladınız.
            </p>
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
