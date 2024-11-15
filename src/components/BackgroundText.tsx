import { motion } from 'framer-motion';

// Configuration for each sentence
const textConfigs = [
  {
    text: 'هر پایانی خودش آغازی است و هر آغازی مسیری است که به پایانی می‌رسد که باز هم آغاز است و',
    speed: 7,
    yPosition: 75,
    direction: 'rtl',
    repetitions: 8
  },
  {
    text: 'لحظه‌ای که می‌گذرد همان لحظه‌ای است که می‌آید و لحظه‌ای که می‌آید همان است،',
    speed: 5,
    yPosition: 1700,
    direction: 'ltr',
    repetitions: 8
  },
  {
    text: 'دوباره آغاز می‌شود پایان هر چیزی چرا که',
    speed: 10,
    yPosition: 1900,
    direction: 'rtl',
    repetitions: 12
  }
];

export function BackgroundText() {
  const createRepeatingText = (text: string, repetitions: number) => {
    // Create a string that's twice as long to ensure smooth looping
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
            width: '200vw', // Make the container twice the viewport width
            left: config.direction === 'rtl' ? '0%' : '-100%' // Adjust starting position
          }}
          animate={{
            x: config.direction === 'rtl' ? '-50%' : '50%' // Move half the width
          }}
          transition={{
            duration: config.speed,
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