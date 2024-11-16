import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface FinalStoryProps {
  show: boolean;
  story: string;
  storyImage?: string;
  storyAudio?: string;
}

export function FinalStory({ show, story, storyImage, storyAudio }: FinalStoryProps) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => audio.removeEventListener('ended', () => setIsPlaying(false));
    }
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share({
        text: story
      });
    } catch (err) {
      await navigator.clipboard.writeText(story);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/95 z-50 p-4 sm:p-8"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-3xl space-y-4 sm:space-y-8"
          >
            {storyAudio && (
              <audio ref={audioRef} src={storyAudio} className="hidden" />
            )}

            {storyImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="relative aspect-square max-w-sm sm:max-w-xl mx-auto rounded-lg overflow-hidden"
              >
                <img
                  src={storyImage}
                  alt="داستان تصویری"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            <motion.div className="space-y-4">
              {storyAudio && (
                <button
                  onClick={toggleAudio}
                  className="mx-auto block text-white/60 hover:text-white transition-colors"
                >
                  {isPlaying ? 'توقف' : 'پخش صدا'}
                </button>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="text-base sm:text-xl leading-relaxed px-2 sm:px-0"
              >
                {story}
              </motion.p>
            </motion.div>

            <div className="flex justify-center gap-4 sm:gap-8 mt-4 sm:mt-8 text-xs sm:text-sm">
              <button
                onClick={handleShare}
                className="text-white/60 hover:text-white transition-colors"
              >
                اشتراک‌گذاری داستان
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-white/60 hover:text-white transition-colors"
              >
                بازگشت به صفحه اصلی
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}