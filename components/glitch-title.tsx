"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_WORD = "ANTEIKU";

const MYSTERY_WORDS = [
  "幽霊",    // ghost
  "東京",    // tokyo
  "珈琲",    // coffee
  "影",      // shadow
  "悪魔",    // demon
  "幻",      // illusion
  "黒",      // black
  "血",      // blood
  "夜",      // night
  "静寂",    // silence
  "uwu",
  "coffee!",
  "miau",
  "tatakae",
  "sugoi!",
  "touka koukan",
  "FLCL",
  "EVA 01",
];

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface GlitchTitleProps {
  className?: string;
}

export function GlitchTitle({ className = "" }: GlitchTitleProps) {
  const [displayWord, setDisplayWord] = useState(BASE_WORD);
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchIndices, setGlitchIndices] = useState<Set<number>>(new Set());
  const [chromaticShift, setChromaticShift] = useState(false);
  const [mysteryFlash, setMysteryFlash] = useState(false);
  const [mysteryWord, setMysteryWord] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pickRandomIndices = useCallback((count: number): Set<number> => {
    const indices = new Set<number>();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * BASE_WORD.length));
    }
    return indices;
  }, []);

  const glitchCycle = useCallback(() => {
    // Phase 1: Scramble 1-3 random characters
    const numToScramble = Math.floor(Math.random() * 3) + 1;
    const indices = pickRandomIndices(numToScramble);
    setGlitchIndices(indices);
    setIsGlitching(true);

    // Scramble characters rapidly
    let scrambleCount = 0;
    const maxScrambles = 6;

    const scrambleInterval = setInterval(() => {
      scrambleCount++;
      const newWord = BASE_WORD.split("").map((char, i) => {
        if (indices.has(i)) {
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        return char;
      });
      setDisplayWord(newWord.join(""));

      if (scrambleCount >= maxScrambles) {
        clearInterval(scrambleInterval);

        // Phase 2: Sometimes flash a mystery word (15% chance)
        if (Math.random() < 0.15) {
          const word = MYSTERY_WORDS[Math.floor(Math.random() * MYSTERY_WORDS.length)];
          setMysteryWord(word);
          setMysteryFlash(true);

          setTimeout(() => {
            setMysteryFlash(false);
            setDisplayWord(BASE_WORD);
            setIsGlitching(false);
            setGlitchIndices(new Set());
          }, 180);
        } else {
          // Just resolve back
          setTimeout(() => {
            setDisplayWord(BASE_WORD);
            setIsGlitching(false);
            setGlitchIndices(new Set());
          }, 120);
        }
      }
    }, 45);
  }, [pickRandomIndices]);

  const triggerGlitch = useCallback(() => {
    // Chromatic aberration flash
    setChromaticShift(true);
    setTimeout(() => setChromaticShift(false), 200);

    // Actual character glitch
    glitchCycle();
  }, [glitchCycle]);

  useEffect(() => {
    // Random intervals between 2-6 seconds for natural feel
    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 4000;
      timeoutRef.current = setTimeout(() => {
        triggerGlitch();
        scheduleNext();
      }, delay);
    };

    // First glitch after 1.5s
    timeoutRef.current = setTimeout(() => {
      triggerGlitch();
      scheduleNext();
    }, 1500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [triggerGlitch]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Chromatic aberration layers */}
      <div className="relative">
        {/* Red channel offset */}
        {chromaticShift && (
          <div
            className="absolute inset-0 text-red-500/30 select-none pointer-events-none"
            style={{ transform: "translate(-2px, 1px)" }}
            aria-hidden
          >
            {BASE_WORD}
          </div>
        )}

        {/* Cyan channel offset */}
        {chromaticShift && (
          <div
            className="absolute inset-0 text-cyan-500/30 select-none pointer-events-none"
            style={{ transform: "translate(2px, -1px)" }}
            aria-hidden
          >
            {BASE_WORD}
          </div>
        )}

        {/* Main text */}
        <AnimatePresence mode="popLayout">
          {mysteryFlash ? (
            <motion.span
              key="mystery"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.08 }}
              className="relative inline-block"
            >
              {mysteryWord}
            </motion.span>
          ) : (
            <span className="relative inline-block">
              {displayWord.split("").map((char, i) => (
                <span
                  key={i}
                  className={`inline-block transition-all duration-75 ${
                    glitchIndices.has(i)
                      ? "text-primary font-mono translate-y-px"
                      : "translate-y-0"
                  }`}
                >
                  {char}
                </span>
              ))}
            </span>
          )}
        </AnimatePresence>
      </div>

      {/* Scanline effect on glitch */}
      {isGlitching && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
            style={{
              animation: "scanline 0.15s linear",
            }}
          />
        </div>
      )}
    </div>
  );
}
