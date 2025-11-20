'use client';

import React from 'react';
import { useDrag } from '@use-gesture/react';
import { animated, useSpring, to } from '@react-spring/web';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SWIPE_THRESHOLD = 80; // pixels

export function SwipeableListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableListItemProps) {
  const [{ x, bg, scale, iconOpacity, iconTransform }, api] = useSpring(() => ({
    x: 0,
    scale: 1,
    bg: 'transparent',
    iconOpacity: 0,
    iconTransform: 'scale(0.8)',
    config: { tension: 300, friction: 30 },
  }));

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
      if (down && Math.abs(mx) > SWIPE_THRESHOLD) {
        if (xDir > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
        cancel();
      }
      
      const isSwiping = down && Math.abs(mx) > 0;
      const opacity = isSwiping ? Math.min(Math.abs(mx) / SWIPE_THRESHOLD, 1) * 0.9 : 0;
      const transform = isSwiping && Math.abs(mx) > 20 ? 'scale(1)' : 'scale(0.8)';
      
      api.start({
        x: down ? mx : 0,
        scale: down ? 1.02 : 1,
        bg: down && mx > 0 ? 'rgba(56, 189, 248, 0.3)' 
            : down && mx < 0 ? 'rgba(239, 68, 68, 0.3)' 
            : 'transparent',
        iconOpacity: opacity,
        iconTransform: transform,
        immediate: name => down && (name === 'x' || name === 'bg'),
      });
    }
  );
  
  return (
    <div className="relative overflow-hidden rounded-lg">
       <animated.div
        className="absolute inset-0 flex items-center justify-between px-4"
        style={{ backgroundColor: bg }}
      >
        <animated.div style={{ 
          opacity: iconOpacity, 
          transform: to([x, iconTransform], (xVal, scaleVal) => `${scaleVal} translateX(${Math.max(0, xVal/4 - 10)}px)`),
          display: to(x, (xVal) => (xVal > 0 ? 'flex' : 'none'))
        }}>
            <Pencil className="h-5 w-5 text-blue-500" />
        </animated.div>
        <animated.div style={{ 
          opacity: iconOpacity,
          transform: to([x, iconTransform], (xVal, scaleVal) => `${scaleVal} translateX(${Math.min(0, xVal/4 + 10)}px)`),
          display: to(x, (xVal) => (xVal < 0 ? 'flex' : 'none'))
        }}>
            <Trash2 className="h-5 w-5 text-red-500" />
        </animated.div>
      </animated.div>
      <animated.div
        {...bind()}
        className="relative touch-pan-y bg-card dark:bg-zinc-800"
        style={{ x, scale }}
      >
        {children}
      </animated.div>
    </div>
  );
}
