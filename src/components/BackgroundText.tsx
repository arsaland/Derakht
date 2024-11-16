import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const textConfigs = [
  {
    text: 'هر پایانی خودش آغازی است و هر آغازی مسیری است که به پایانی می‌رسد که باز هم آغاز است و',
    speed: 55,
    yPosition: 5,
    direction: 'ltr',
  },
  {
    text: 'لحظه‌ای که می‌گذرد همان لحظه‌ای است که می‌آید و لحظه‌ای که می‌آید همان است،',
    speed: 46,
    yPosition: 20,
    direction: 'rtl',
  },
  {
    text: 'دوباره آغاز می‌شود پایان هر چیزی چرا که',
    speed: 35,
    yPosition: 85,
    direction: 'ltr',
  },
];

export function BackgroundText() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createRepeatingText = (text: string) => {
    return Array(20).fill(text).join(' ');
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {textConfigs.map((config, index) => {
        const repeatedText = createRepeatingText(config.text);

        return (
          <div
            key={index}
            className="absolute w-[300vw] overflow-visible whitespace-nowrap"
            style={{
              top: `${config.yPosition}%`,
              ...(config.direction === 'rtl'
                ? { right: '-200vw' }  // Changed positioning for RTL
                : { left: '-100vw' }), // Kept original for LTR
            }}
          >
            <motion.div
              className="inline-block text-gray-700/50 text-3xl blur-[1px]"
              initial={{ x: '0%' }}
              animate={{ x: config.direction === 'rtl' ? '-33.33%' : '33.33%' }}
              transition={{
                duration: config.speed,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop"
              }}
            >
              {repeatedText}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}