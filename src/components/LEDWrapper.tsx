import React, { useEffect, useState, useMemo } from 'react';

interface LEDWrapperProps {
  targetWidth: number;
  targetHeight: number;
  children: React.ReactNode;
  padding?: { top: number; bottom: number; left: number; right: number };
}

export const LEDWrapper: React.FC<LEDWrapperProps> = ({
  targetWidth,
  targetHeight,
  children,
  padding = { top: 0, bottom: 0, left: 0, right: 0 }
}) => {
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScale = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      
      const scaleW = winW / targetWidth;
      const scaleH = winH / targetHeight;
      const newScale = Math.min(scaleW, scaleH);
      
      setScale(newScale);
      setContainerSize({ width: winW, height: winH });
    };

    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, [targetWidth, targetHeight]);

  const wrapperStyle: React.CSSProperties = {
    width: targetWidth,
    height: targetHeight,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -targetWidth / 2,
    marginTop: -targetHeight / 2,
    overflow: 'hidden',
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center overflow-hidden">
      <div style={wrapperStyle}>
        {children}
      </div>
    </div>
  );
};
