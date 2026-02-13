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
    // ✅ จุดที่ 1: กำหนดค่าเริ่มต้นเป็น 0 เพื่อให้ TS สบายใจ
    let animationFrameId: number = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const mouse = {
      x: -100,
      y: -100,
      radius: 150,
    };

    // ✅ จุดที่ 2: แยกฟังก์ชัน mouseMove ออกมาเพื่อให้ลบออกได้ตอน Cleanup
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    window.addEventListener("mousemove", handleMouseMove);

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor() {
        this.size = Math.random() * 2 + 1;
        this.x = Math.random() * (canvas!.width - this.size * 2) + this.size * 2;
        this.y = Math.random() * (canvas!.height - this.size * 2) + this.size * 2;
        this.directionX = Math.random() * 2 - 1;
        this.directionY = Math.random() * 2 - 1;
        this.color = "#8b5cf6";
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        if (this.x > canvas!.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas!.height || this.y < 0) this.directionY = -this.directionY;

        this.x += this.directionX * 0.4;
        this.y += this.directionY * 0.4;

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

    function init() {
      particlesArray = [];
      const numberOfParticles = (canvas!.width * canvas!.height) / 15000;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distance =
            (particlesArray[a].x - particlesArray[b].x) *
              (particlesArray[a].x - particlesArray[b].x) +
            (particlesArray[a].y - particlesArray[b].y) *
              (particlesArray[a].y - particlesArray[b].y);

          if (distance < (canvas!.width / 7) * (canvas!.height / 7)) {
            opacityValue = 1 - distance / 20000;
            if (!ctx) return;
            ctx.strokeStyle = `rgba(140, 100, 255, ${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
        
        const dx = mouse.x - particlesArray[a].x;
        const dy = mouse.y - particlesArray[a].y;
        const distanceMouse = dx*dx + dy*dy;
        if (distanceMouse < mouse.radius * mouse.radius * 2) {
             if (!ctx) return;
             ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
             ctx.beginPath();
             ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
             ctx.lineTo(mouse.x, mouse.y);
             ctx.stroke();
        }
      }
    }

    function animate() {
      // ✅ จุดที่ 3: เก็บค่า ID จาก requestAnimationFrame ไว้ที่นี่
      animationFrameId = requestAnimationFrame(animate);
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
      window.removeEventListener("mousemove", handleMouseMove);
      // ✅ ตอนนี้ animationFrameId จะมีค่าแน่นอนแล้ว
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