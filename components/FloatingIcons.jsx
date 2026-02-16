"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Coffee, Croissant, Pizza, Sandwich, Utensils, CupSoda, IceCream, CakeSlice, Drumstick } from 'lucide-react';

const icons = [
  Coffee, Croissant, Pizza, Sandwich, Utensils, CupSoda, IceCream, CakeSlice, Drumstick
];

export function FloatingIcons() {
  const containerRef = useRef(null);
  const [items, setItems] = useState([]);
  const requestRef = useRef();
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    // Inicializar items con posiciones y velocidades aleatorias
    const initialItems = Array.from({ length: 35 }).map((_, i) => {
      const Icon = icons[i % icons.length];
      return {
        id: i,
        Icon,
        x: Math.random() * 100, // porcentaje inicial
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.15, // velocidad base
        vy: (Math.random() - 0.5) * 0.15,
        size: 40 + Math.random() * 50, // 40px a 90px
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 1
      };
    });
    setItems(initialItems);

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
        mouseRef.current = { x: -1000, y: -1000 };
    }

    // Usamos window para asegurar captura global si es full screen
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      setItems(prevItems => prevItems.map(item => {
        let { x, y, vx, vy, vRot, rotation } = item;
        
        // Convertir % a px para física
        let px = (x / 100) * containerWidth;
        let py = (y / 100) * containerHeight;

        // Repulsión del mouse (Física de Hockey)
        const dx = px - mouseRef.current.x;
        const dy = py - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 200; // Radio de efecto aumentado

        if (dist < radius) {
          const force = (radius - dist) / radius; // 0 a 1
          const angle = Math.atan2(dy, dx);
          
          const push = 2.0 * force; // Fuerza de empuje fuerte
          
          vx += Math.cos(angle) * push;
          vy += Math.sin(angle) * push;
        }

        // Fricción (para que desaceleren después del empuje)
        vx *= 0.96;
        vy *= 0.96;

        // Velocidad mínima para que siempre floten suavemente
        const speed = Math.sqrt(vx*vx + vy*vy);
        if (speed < 0.1) {
            vx += (Math.random() - 0.5) * 0.02;
            vy += (Math.random() - 0.5) * 0.02;
        }

        // Limite de velocidad máxima para evitar caos
        const maxSpeed = 8;
        if (speed > maxSpeed) {
             const ratio = maxSpeed / speed;
             vx *= ratio;
             vy *= ratio;
        }

        // Actualizar posición
        px += vx;
        py += vy;
        rotation += vRot;

        // Rebote en bordes
        if (px < -50 || px > containerWidth + 50) {
            vx *= -1;
            // px = Math.max(0, Math.min(px, containerWidth)); // Permitir salir un poco para naturalidad
        }
        if (py < -50 || py > containerHeight + 50) {
            vy *= -1;
        }
        
        // Wrap around si se van muy lejos (opcional, mejor rebote)
        if (px < -100) px = containerWidth + 100;
        if (px > containerWidth + 100) px = -100;
        if (py < -100) py = containerHeight + 100;
        if (py > containerHeight + 100) py = -100;

        // Convertir de nuevo a %
        return {
          ...item,
          x: (px / containerWidth) * 100,
          y: (py / containerHeight) * 100,
          vx,
          vy,
          rotation
        };
      }));

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {items.map(item => {
        const Icon = item.Icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1 }} // Opacidad fija baja para sutileza
            className="absolute text-[#402E24]"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.size,
              height: item.size,
              x: '-50%', // Centrar el div en su coordenada x
              y: '-50%', // Centrar el div en su coordenada y
              rotate: item.rotation,
            }}
          >
            <Icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
}
