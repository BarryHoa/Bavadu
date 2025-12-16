"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface LoadingBarProps {
  isLoading: boolean;
}

const MAX_PROGRESS = 90;
const PROGRESS_INTERVAL = 200;
const COMPLETE_DELAY = 300;

export function LoadingBar({ isLoading }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    // Clear any existing timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isLoading) {
      // Start loading
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= MAX_PROGRESS) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            return MAX_PROGRESS;
          }

          return Math.min(prev + Math.random() * 10, MAX_PROGRESS);
        });
      }, PROGRESS_INTERVAL);
    } else if (prevLoadingRef.current) {
      // Loading just finished - complete animation
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(100);
      timeoutRef.current = setTimeout(() => {
        setProgress(0);
        timeoutRef.current = null;
      }, COMPLETE_DELAY);
    }

    prevLoadingRef.current = isLoading;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading]);

  const isVisible = isLoading || progress > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ width: `${progress}%` }}
          className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          exit={{ width: "100%", opacity: 0 }}
          initial={{ width: "0%" }}
          style={{ boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}
