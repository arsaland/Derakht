import { motion } from 'framer-motion';

// Configuration for each sentence
const textConfigs = [
  {
    text: 'هر پایانی خودش آغازی است و هر آغازی مسیری است که به پایانی می‌رسد که باز هم آغاز است و',
    speed: 7,
    yPosition: 75,
    direction: 'ltr',
    repetitions: 8
  },
  {
    text: 'لحظه‌ای که می‌گذرد همان لحظه‌ای است که می‌آید و لحظه‌ای که می‌آید همان است،',
    speed: 5,
    yPosition: 1700,
    direction: 'rtl',
    repetitions: 8
  },
  {
    text: 'دوباره آغاز می‌شود پایان هر چیزی چرا که',
    speed: 10,
    yPosition: 1900,
    direction: 'ltr',
    repetitions: 12
  }
];

export function BackgroundText() {
  const createRepeatingText = (text: string, repetitions: number) => {
    return Array(repetitions * 2).fill(`${text} `).join('');
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {textConfigs.map((config, index) => (
        <motion.div
          key={index}
          className="absolute whitespace-nowrap text-gray-700/50 text-3xl blur-[1px]"
          style={{
            y: `${config.yPosition}%`,
            width: '300vw', // Increased from 200vw to ensure full coverage
            left: config.direction === 'rtl' ? '0%' : '-200%', // Adjusted starting position
            transform: 'translateZ(0)' // Enable hardware acceleration
          }}
          animate={{
            x: config.direction === 'rtl' ? '-66.666%' : '66.666%' // Adjusted animation distance
          }}
          transition={{
            duration: config.speed * 1.5, // Slightly slower speed for smoother animation
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        >
          {createRepeatingText(config.text, config.repetitions)}
        </motion.div>
      ))}
    </div>
  );
}