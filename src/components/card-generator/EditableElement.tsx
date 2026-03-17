
"use client";

import React, { useState, useCallback } from 'react';
import type { ElementLayout } from '@/lib/card-types';
import { cn } from '@/lib/utils';

interface EditableElementProps {
  children: React.ReactNode;
  id: string;
  layout: ElementLayout;
  onUpdate: (newLayout: Partial<ElementLayout>) => void;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function EditableElement({ children, id, layout, onUpdate, scale, containerRef }: EditableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX / scale;
    const startY = e.clientY / scale;
    const startLeft = layout.x;
    const startTop = layout.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = startLeft + (moveEvent.clientX / scale - startX);
      const newY = startTop + (moveEvent.clientY / scale - startY);
      onUpdate({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [layout.x, layout.y, onUpdate, scale]);


  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX / scale;
    const startY = e.clientY / scale;
    const startWidth = layout.width;
    const startHeight = layout.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX / scale - startX);
      const newHeight = startHeight + (moveEvent.clientY / scale - startY);
      onUpdate({ width: Math.max(20, newWidth), height: Math.max(20, newHeight) });
    };

    const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

  }, [layout.width, layout.height, onUpdate, scale]);

  return (
    <div
      id={id}
      style={{
        top: `${layout.y * scale}px`,
        left: `${layout.x * scale}px`,
        width: `${layout.width * scale}px`,
        height: `${layout.height * scale}px`,
      }}
      className={cn(
        "absolute border border-dashed border-primary/50 cursor-move flex items-center transition-all duration-75 ease-in-out",
        (isDragging || isResizing) && "border-primary border-solid shadow-2xl z-10"
      )}
      onMouseDown={handleDragStart}
    >
      <div className="w-full h-full overflow-hidden flex items-center">
        {children}
      </div>
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize border-2 border-card"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
}
