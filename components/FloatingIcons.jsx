"use client";

import { useEffect, useRef, useState } from 'react';
import { Coffee, Croissant, Pizza, Sandwich, Utensils, CupSoda, IceCream, CakeSlice, Drumstick } from 'lucide-react';

const icons = [
  Coffee, Croissant, Pizza, Sandwich, Utensils, CupSoda, IceCream, CakeSlice, Drumstick
];

export function FloatingIcons() {
  const containerRef = useRef(null);
  const requestRef = useRef();
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const itemsRef = useRef([]);
  const domRefs = useRef([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Generate static physical properties only once
    itemsRef.current = Array.from({ length: 35 }).map((_, i) => {
      const Icon = icons[i % icons.length];
      const baseVx = (Math.random() - 0.5) * 0.5;
      const baseVy = (Math.random() - 0.5) * 0.5;
      
      return {
        id: i,
        Icon,
        x: Math.random() * 100, // starting percentage
        y: Math.random() * 100,
        px: 0, // will be computed when container mounts
        py: 0,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        size: 40 + Math.random() * 50,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 0.8
      };
    });
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || !containerRef.current) return;

    // Convert percentages to initial px based on container size
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    itemsRef.current.forEach(item => {
        item.px = (item.x / 100) * containerWidth;
        item.py = (item.y / 100) * containerHeight;
    });

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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let lastTime = performance.now();

    const animate = (time) => {
      if (!containerRef.current) return;
      
      // Use time delta for strictly smooth physics, but simple px/frame is okay if 60fps is stable.
      // We will stick to frame-based for simplicity, but DOM updates are synchronous and skip React state.
      
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      const items = itemsRef.current;

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let { px, py, vx, vy, vRot, rotation, size, baseVx, baseVy } = item;
        const radiusSelf = size / 2;

        // Mouse repulsion
        const dxMouse = px - mouseRef.current.x;
        const dyMouse = py - mouseRef.current.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 200) {
          const force = (200 - distMouse) / 200;
          const angle = Math.atan2(dyMouse, dxMouse);
          vx += Math.cos(angle) * force * 1.5;
          vy += Math.sin(angle) * force * 1.5;
        }

        // Collision with other icons
        for (let j = 0; j < items.length; j++) {
          if (i === j) continue;
          const other = items[j];
          const radiusOther = other.size / 2;
          
          const dx = px - other.px;
          const dy = py - other.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = radiusSelf + radiusOther + 15;

          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) / minDist;
            const angle = Math.atan2(dy, dx);
            vx += Math.cos(angle) * force * 0.3;
            vy += Math.sin(angle) * force * 0.3;
          }
        }

        // Return gracefully to base speed
        vx = vx * 0.95 + baseVx * 0.05;
        vy = vy * 0.95 + baseVy * 0.05;

        // Cap speed
        const speed = Math.sqrt(vx*vx + vy*vy);
        if (speed > 6) {
           vx = (vx / speed) * 6;
           vy = (vy / speed) * 6;
        }

        px += vx;
        py += vy;
        rotation += vRot;
        
        // Wrap around bounds (increase bounds to 250 to ensure they are fully invisible when wrapping)
        if (px < -250) px = width + 250;
        if (px > width + 250) px = -250;
        if (py < -250) py = height + 250;
        if (py > height + 250) py = -250;

        // Calculate dynamic opacity for smooth fade at edges
        const distFromLeft = px;
        const distFromRight = width - px;
        const distFromTop = py;
        const distFromBottom = height - py;
        
        const closestEdge = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom);
        
        let opacity = 0.15;
        // Fade starts 50px inside screen, fully transparent at 150px outside screen
        if (closestEdge < 50) {
            const fadeRatio = (closestEdge + 150) / 200; // 1 at 50, 0 at -150
            opacity = Math.max(0, Math.min(0.15, 0.15 * fadeRatio));
        }

        // Save new values back to ref
        item.px = px;
        item.py = py;
        item.vx = vx;
        item.vy = vy;
        item.rotation = rotation;

        // Directly manipulate the DOM element for jitter-free 60fps + hardware acceleration
        const el = domRefs.current[i];
        if (el) {
           el.style.transform = `translate3d(${px}px, ${py}px, 0) translate3d(-50%, -50%, 0) rotate(${rotation}deg)`;
           el.style.opacity = opacity.toFixed(3);
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
        cancelAnimationFrame(requestRef.current);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [initialized]);

  if (!initialized) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {itemsRef.current.map((item, i) => {
        const Icon = item.Icon;
        return (
          <div
            key={item.id}
            ref={el => domRefs.current[i] = el}
            className="absolute text-[#402E24] opacity-15"
            style={{
              left: 0,
              top: 0,
              width: item.size,
              height: item.size,
              willChange: 'transform',
              // Initial hardware accelerated transform to prevent jump before first frame
              transform: `translate3d(-1000px, -1000px, 0) translate3d(-50%, -50%, 0) rotate(${item.rotation}deg)`
            }}
          >
            <Icon size={item.size} strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
}
