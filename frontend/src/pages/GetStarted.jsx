"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

const dataStructures = [
  "Min-Heap",
  "BST",
  "Priority Queue",
  "Hash Table",
  "Linked List",
  "Graph",
  "Array",
];

export default function GetStarted({ onStart }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dataStructures.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuroraBackground className="!bg-white" showRadialGradient={false}>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-2 items-center justify-center px-4 z-10"
      >
        <div className="text-3xl md:text-6xl font-light text-gray-400 text-center">
          Powered by
        </div>

        {/* Animated Cycling Text - Bold Black */}
        <div className="h-16 md:h-24 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-4xl md:text-6xl font-bold text-black"
            >
              {dataStructures[currentIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="font-normal text-sm md:text-base text-gray-500 py-4 text-center max-w-lg mt-4 leading-relaxed">
          Experience the power of optimized data structures driving predictive inventory management. Our system uses advanced algorithms to streamline operations.
        </div>

        <button
          onClick={onStart}
          className="bg-black rounded-full w-fit text-white px-8 py-3 mt-4 font-medium hover:bg-gray-800 transition-all cursor-pointer text-sm"
        >
          Enter System →
        </button>
      </motion.div>
    </AuroraBackground>
  );
}
