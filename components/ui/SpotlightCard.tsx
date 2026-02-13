"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ฟังก์ชันช่วยรวม Class
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(120, 50, 255, 0.25)", // สีม่วงๆ
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-purple-500/10",
        className
      )}
      // Effect กดแล้วยุบลงเล็กน้อย (Tap Animation)
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {/* Spotlight Overlay Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 40%
            )
          `,
        }}
      />
      
      {/* Content */}
      <div className="relative h-full w-full">{children}</div>
    </motion.div>
  );
}