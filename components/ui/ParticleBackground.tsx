"use client";

import React, { useRef, useEffect } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    // ปรับขนาด Canvas ให้เต็มจอ
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // จัดการเมาส์
    const mouse = {
      x: -100, // เริ่มต้นนอกจอ
      y: -100,
      radius: 150, // รัศมีที่เส้นจะเชื่อมถึง
    };

    window.addEventListener("mousemove", (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    // คลาสสำหรับเม็ดอนุภาค
    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * (canvas!.width - size * 2) + size * 2;
        this.y = Math.random() * (canvas!.height - size * 2) + size * 2;
        this.directionX = Math.random() * 2 - 1; // ความเร็ว X (-1 ถึง 1)
        this.directionY = Math.random() * 2 - 1; // ความเร็ว Y
        this.size = Math.random() * 2 + 1; // ขนาด 1-3px
        this.color = "#8b5cf6"; // สีม่วงอ่อนๆ
      }

      // วาดจุด
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      // คำนวณการเคลื่อนที่
      update() {
        // ชนขอบแล้วเด้งกลับ
        if (this.x > canvas!.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas!.height || this.y < 0) this.directionY = -this.directionY;

        // เคลื่อนที่
        this.x += this.directionX * 0.4; // ปรับความเร็วตรงนี้ (0.4 คือช้าๆ นุ่มๆ)
        this.y += this.directionY * 0.4;

        // Interactive: ถ้าเมาส์อยู่ใกล้ ให้ขยายขนาดนิดนึง
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
            if (this.size < 4) this.size += 0.2;
        } else if (this.size > 2) {
            this.size -= 0.1;
        }

        this.draw();
      }
    }

    // สร้าง Particle จำนวนมาก
    function init() {
      particlesArray = [];
      // จำนวน Particle ตามขนาดจอ (จอกว้าง = เยอะ)
      const numberOfParticles = (canvas!.width * canvas!.height) / 15000;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    // ลากเส้นเชื่อมจุด
    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distance =
            (particlesArray[a].x - particlesArray[b].x) *
              (particlesArray[a].x - particlesArray[b].x) +
            (particlesArray[a].y - particlesArray[b].y) *
              (particlesArray[a].y - particlesArray[b].y);

          // ถ้าใกล้กัน ให้ลากเส้น
          if (distance < (canvas!.width / 7) * (canvas!.height / 7)) {
            opacityValue = 1 - distance / 20000;
            if (!ctx) return;
            ctx.strokeStyle = `rgba(140, 100, 255, ${opacityValue})`; // สีเส้น (ม่วงจางๆ)
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
        
        // ลากเส้นหาเมาส์ด้วย
        const dx = mouse.x - particlesArray[a].x;
        const dy = mouse.y - particlesArray[a].y;
        const distanceMouse = dx*dx + dy*dy;
        if (distanceMouse < mouse.radius * mouse.radius * 2) {
             if (!ctx) return;
             ctx.strokeStyle = `rgba(255, 255, 255, ${0.2})`; // เส้นหาเมาส์สีขาวจางๆ
             ctx.beginPath();
             ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
             ctx.lineTo(mouse.x, mouse.y);
             ctx.stroke();
        }
      }
    }

    // ลูปอนิเมชั่น
    function animate() {
      requestAnimationFrame(animate);
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", () => {});
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}

// ตัวแปรขนาดเริ่มต้น (ไว้นอก class เพื่อเลี่ยง error ts)
const size = 1;