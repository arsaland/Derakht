import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FinalStoryProps {
  show: boolean;
  story: string;
  storyImage?: string;
}

export function FinalStory({ show, story, storyImage }: FinalStoryProps) {
  const navigate = useNavigate();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'داستان درخت',
        text: story,
        url: storyImage
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
          className="fixed inset-0 flex items-center justify-center bg-black/95 z-50 p-8"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl space-y-8"
          >
            {storyImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="relative aspect-square max-w-xl mx-auto rounded-lg overflow-hidden"
              >
                <img
                  src={storyImage}
                  alt="داستان تصویری"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-xl leading-relaxed"
            >
              {story}
            </motion.p>

            <div className="flex justify-center gap-8 mt-8 text-sm">
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