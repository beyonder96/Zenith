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
  const [{ x, bg, scale, iconOpacity }, api] = useSpring(() => ({
    x: 0,
    scale: 1,
    bg: 'transparent',
    iconOpacity: 0,
  }));

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity: [vx], cancel, canceled }) => {
      if (down && Math.abs(mx) > SWIPE_THRESHOLD) {
        if (xDir > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
        cancel();
      }
      
      api.start({
        x: down ? mx : 0,
        scale: down ? 1.02 : 1,
        bg: down && mx > 0 ? 'rgba(34, 197, 94, 0.2)' 
            : down && mx < 0 ? 'rgba(239, 68, 68, 0.2)' 
            : 'transparent',
        iconOpacity: Math.abs(mx) > SWIPE_THRESHOLD / 2 ? 1 : Math.abs(mx) / (SWIPE_THRESHOLD / 2),
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
        <animated.div style={{ opacity: iconOpacity, x: to(x, x => Math.max(0, x - SWIPE_THRESHOLD/2)) }}>
            <Pencil className="h-5 w-5 text-blue-500" />
        </animated.div>
        <animated.div style={{ opacity: iconOpacity, x: to(x, x => Math.min(0, x + SWIPE_THRESHOLD/2)) }}>
            <Trash2 className="h-5 w-5 text-red-500" />
        </animated.div>
      </animated.div>
      <animated.div
        {...bind()}
        className="relative touch-pan-y"
        style={{ x, scale }}
      >
        {children}
      </animated.div>
    </div>
  );
}
