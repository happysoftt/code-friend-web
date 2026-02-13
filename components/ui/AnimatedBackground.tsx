"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [blobs, setBlobs] = useState<any[]>([]);

  useEffect(() => {
    // ย้ายการสุ่มมาทำในนี้ เพื่อให้รันเฉพาะบน Browser
    const generatedBlobs = Array.from({ length: 3 }).map((_, i) => ({
      id: i,
      initialX: Math.random() * 100 - 50 + "%",
      initialY: Math.random() * 100 - 50 + "%",
      scale: Math.random() * 1.5 + 0.5,
      color: i % 2 === 0 ? "bg-purple-600/30" : "bg-blue-600/30",
    }));
    setBlobs(generatedBlobs);
  }, []);

  // ถ้ายังโหลดไม่เสร็จ (ยังไม่มีข้อมูล Blobs) ไม่ต้องแสดงอะไร
  if (blobs.length === 0) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className={`absolute rounded-full blur-[100px] mix-blend-screen ${blob.color}`}
          style={{
            left: blob.initialX,
            top: blob.initialY,
            width: `${blob.scale * 400}px`,
            height: `${blob.scale * 400}px`,
          }}
          animate={{
            x: ["-25%", "25%", "-25%"],
            y: ["-20%", "20%", "-20%"],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-slate-950/60 opacity-20 mix-blend-overlay"></div>
    </div>
  );
}