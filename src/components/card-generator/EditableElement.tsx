
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
    if ((e.target as HTMLElement).closest('.resize-handle')) {
        return;
    }
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


  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLayout = { ...layout };
    const originalAspectRatio = startLayout.width / startLayout.height;
    const isCorner = direction.includes('-');

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / scale;
      const dy = (moveEvent.clientY - startY) / scale;

      let newX = startLayout.x;
      let newY = startLayout.y;
      let newWidth = startLayout.width;
      let newHeight = startLayout.height;

      if (isCorner) {
        const widthChange = direction.includes('left') ? -dx : dx;
        const heightChange = direction.includes('top') ? -dy : dy;
        
        let newSize;
        if (moveEvent.shiftKey) { // Free resize with shift
            newWidth = startLayout.width + widthChange;
            newHeight = startLayout.height + heightChange;
        }
        else if (Math.abs(widthChange) > Math.abs(heightChange)) {
          newSize = startLayout.width + widthChange;
          newWidth = newSize;
          newHeight = newSize / originalAspectRatio;
        } else {
          newSize = startLayout.height + heightChange;
          newHeight = newSize;
          newWidth = newSize * originalAspectRatio;
        }
      } else { // Side handles
        if (direction === 'right') {
          newWidth = startLayout.width + dx;
        } else if (direction === 'left') {
          newWidth = startLayout.width - dx;
          newX = startLayout.x + dx;
        } else if (direction === 'bottom') {
          newHeight = startLayout.height + dy;
        } else if (direction === 'top') {
          newHeight = startLayout.height - dy;
          newY = startLayout.y + dy;
        }
      }
      
      const minSize = 20;
      if (newWidth < minSize) {
        newWidth = minSize;
        if (isCorner && !moveEvent.shiftKey) newHeight = newWidth / originalAspectRatio;
      }
      if (newHeight < minSize) {
        newHeight = minSize;
        if (isCorner && !moveEvent.shiftKey) newWidth = newHeight * originalAspectRatio;
      }

      // After potential clamping, recalculate position for top/left drags
      if (direction.includes('left')) {
        newX = startLayout.x + startLayout.width - newWidth;
      }
      if (direction.includes('top')) {
        newY = startLayout.y + startLayout.height - newHeight;
      }

      onUpdate({ x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [layout, onUpdate, scale]);

  const handleStyles: React.CSSProperties = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: 'hsl(var(--primary))',
    border: '1px solid hsl(var(--card))',
    borderRadius: '50%',
    zIndex: 20,
  };

  const handles = [
    { direction: 'top-left', style: { top: -5, left: -5, cursor: 'nwse-resize' } },
    { direction: 'top', style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
    { direction: 'top-right', style: { top: -5, right: -5, cursor: 'nesw-resize' } },
    { direction: 'right', style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' } },
    { direction: 'bottom-right', style: { bottom: -5, right: -5, cursor: 'nwse-resize' } },
    { direction: 'bottom', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
    { direction: 'bottom-left', style: { bottom: -5, left: -5, cursor: 'nesw-resize' } },
    { direction: 'left', style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' } },
  ];

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
        "absolute border border-dashed border-primary/50 cursor-move transition-all duration-75 ease-in-out",
        (isDragging || isResizing) && "border-primary border-solid shadow-2xl z-10"
      )}
      onMouseDown={handleDragStart}
    >
      <div className="w-full h-full relative">
        {children}
      </div>
      {handles.map(handle => (
        <div
            key={handle.direction}
            className="resize-handle"
            style={{ ...handleStyles, ...handle.style }}
            onMouseDown={(e) => handleResizeStart(e, handle.direction)}
        />
      ))}
    </div>
  );
}
