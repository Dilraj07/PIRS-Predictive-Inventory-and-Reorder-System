"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AuroraBlob = ({ color, size, initialPosition, blur, delay = 0 }) => {
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    const moveBlob = () => {
      const newX = initialPosition.x + (Math.random() - 0.5) * 150;
      const newY = initialPosition.y + (Math.random() - 0.5) * 150;
      const newScale = 0.85 + Math.random() * 0.3;
      setPosition({ x: newX, y: newY, scale: newScale });
    };

    // Initial delay before starting
    const initialTimeout = setTimeout(() => {
      moveBlob();
    }, delay);

    // Random interval between 1.5-3 seconds
    const interval = setInterval(() => {
      moveBlob();
    }, 1500 + Math.random() * 1500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [initialPosition, delay]);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      initial={{
        x: initialPosition.x,
        y: initialPosition.y,
        scale: 1,
        opacity: 0
      }}
      animate={{
        x: position.x,
        y: position.y,
        scale: position.scale || 1,
        opacity: 1
      }}
      transition={{
        duration: 2 + Math.random() * 1,
        ease: "easeInOut",
        opacity: { duration: 0.5 }
      }}
      style={{
        width: size,
        height: size,
        background: color,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

export const AuroraBackground = ({
  className,
  children,
  ...props
}) => {
  const blobs = [
    {
      color: 'radial-gradient(circle, rgba(96, 165, 250, 0.5) 0%, rgba(147, 197, 253, 0.25) 35%, transparent 70%)',
      size: 800,
      initialPosition: { x: window.innerWidth - 400, y: -200 },
      blur: 40,
      delay: 0,
    },
    {
      color: 'radial-gradient(circle, rgba(167, 139, 250, 0.5) 0%, rgba(196, 181, 253, 0.2) 40%, transparent 70%)',
      size: 750,
      initialPosition: { x: -200, y: window.innerHeight - 300 },
      blur: 50,
      delay: 500,
    },
    {
      color: 'radial-gradient(circle, rgba(129, 140, 248, 0.45) 0%, rgba(165, 180, 252, 0.15) 45%, transparent 70%)',
      size: 550,
      initialPosition: { x: window.innerWidth - 300, y: window.innerHeight / 3 },
      blur: 45,
      delay: 1000,
    },
    {
      color: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, rgba(103, 232, 249, 0.12) 45%, transparent 70%)',
      size: 450,
      initialPosition: { x: window.innerWidth / 4, y: -100 },
      blur: 40,
      delay: 1500,
    },
    {
      color: 'radial-gradient(ellipse, rgba(192, 132, 252, 0.45) 0%, rgba(221, 214, 254, 0.12) 50%, transparent 70%)',
      size: 600,
      initialPosition: { x: window.innerWidth / 2 - 300, y: window.innerHeight - 200 },
      blur: 50,
      delay: 2000,
    },
  ];

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <div
        className={cn(
          "relative flex flex-col h-full items-center justify-center bg-white",
          className
        )}
        {...props}
      >
        {/* Aurora Light Blobs Container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {blobs.map((blob, index) => (
            <AuroraBlob
              key={index}
              color={blob.color}
              size={blob.size}
              initialPosition={blob.initialPosition}
              blur={blob.blur}
              delay={blob.delay}
            />
          ))}
        </div>

        {/* Content */}
        {children}
      </div>
    </main>
  );
};
