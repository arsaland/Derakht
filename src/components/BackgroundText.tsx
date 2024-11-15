import { motion } from 'framer-motion';

const texts = [
  'هر پایانی خودش آغازی است و هر آغازی مسیری است که به پایانی می‌رسد که باز هم آغاز است و',
  'لحظه‌ای که می‌گذرد همان لحظه‌ای است که می‌آید و لحظه‌ای که می‌آید همان است،',
  'دوباره آغاز می‌شود پایان هر چیزی چرا که'
];

export function BackgroundText() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {texts.map((text, index) => (
        <motion.div
          key={index}
          className="absolute whitespace-nowrap text-gray-800 text-2xl blur-sm"
          initial={{ 
            x: index % 2 === 0 ? '100%' : '-100%',
            y: `${(index + 1) * 25}%`
          }}
          animate={{ 
            x: index % 2 === 0 ? '-100%' : '100%'
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {text}
        </motion.div>
      ))}
    </div>
  );
}