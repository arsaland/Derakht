import { motion, AnimatePresence } from 'framer-motion';

interface RoundTransitionProps {
  round: number;
  show: boolean;
}

export function RoundTransition({ round, show }: RoundTransitionProps) {
  const texts = ['مقدمه', 'گسترش', 'اوج', 'پایان'];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black/90 z-50"
        >
          <motion.h2
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold"
          >
            {texts[round - 1]}
          </motion.h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
}