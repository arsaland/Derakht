import { motion } from 'framer-motion';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

// Configuration for each sentence
const textConfigs = [
  {
    text: 'هر پایانی خودش آغازی است و هر آغازی مسیری است که به پایانی می‌رسد که باز هم آغاز است و',
    speed: 10, // Duration in seconds
    yPosition: 15, // Percentage from top
    direction: 'ltr', // 'ltr' or 'rtl'
  },
  {
    text: 'لحظه‌ای که می‌گذرد همان لحظه‌ای است که می‌آید و لحظه‌ای که می‌آید همان است،',
    speed: 5,
    yPosition: 50,
    direction: 'rtl',
  },
  {
    text: 'دوباره آغاز می‌شود پایان هر چیزی چرا که',
    speed: 15,
    yPosition: 85,
    direction: 'ltr',
  },
];

export function BackgroundText() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [textWidths, setTextWidths] = useState<number[]>([]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure text widths after render
  useLayoutEffect(() => {
    const widths = textRefs.current.map(
      (span) => span?.offsetWidth || windowWidth
    );
    setTextWidths(widths);
  }, [windowWidth, textConfigs]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {textConfigs.map((config, index) => {
        const textWidth = textWidths[index] || windowWidth;
        const spacing = 100; // Space in pixels between copies

        return (
          <div
            key={index}
            className="absolute flex items-center overflow-hidden whitespace-nowrap text-gray-700/50 text-3xl blur-[1px]"
            style={{ top: `${config.yPosition}%`, width: '200%' }}
          >
            <motion.div
              className="flex"
              initial={
                config.direction === 'rtl'
                  ? { x: 0 }
                  : { x: -textWidth - spacing }
              }
              animate={
                config.direction === 'rtl'
                  ? { x: -textWidth - spacing }
                  : { x: textWidth + spacing }
              }
              transition={{
                duration: config.speed,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                display: 'flex',
                flexDirection:
                  config.direction === 'rtl' ? 'row-reverse' : 'row',
              }}
            >
              {/* First copy */}
              <span
                ref={(el) => (textRefs.current[index * 2] = el)}
                className="inline-block"
              >
                {config.text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              {/* Second copy */}
              <span
                ref={(el) => (textRefs.current[index * 2 + 1] = el)}
                className="inline-block"
              >
                {config.text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}