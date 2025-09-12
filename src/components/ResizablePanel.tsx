import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right'; // Side from which it resizes
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  initialWidth = 250,
  minWidth = 200,
  maxWidth = 500,
  side = 'left',
}) => {
  const [width, setWidth] = useState(initialWidth);
  const panelRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !panelRef.current) return;

    let newWidth;
    if (side === 'left') {
      newWidth = e.clientX - panelRef.current.getBoundingClientRect().left;
    } else {
      newWidth = panelRef.current.getBoundingClientRect().right - e.clientX;
    }

    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setWidth(newWidth);
  }, [minWidth, maxWidth, side]);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={panelRef}
      style={{
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      className="border-r border-gray-200" // Add border for visual separation
    >
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          cursor: side === 'left' ? 'ew-resize' : 'ew-resize', // Resizing from left or right
          [side === 'left' ? 'right' : 'left']: '-5px', // Position the handle
          width: '10px',
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.1)', // Add a subtle background color
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};