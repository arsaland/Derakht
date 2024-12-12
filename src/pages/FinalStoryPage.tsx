import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Share2 } from 'lucide-react';

interface FinalStoryPageState {
    story: string;
    storyImage?: string;
    storyAudio?: string;
}

export default function FinalStoryPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { story, storyImage, storyAudio } = location.state as FinalStoryPageState;
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(error => {
                    console.error('Audio playback error:', error);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

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
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        بازگشت به صفحه اصلی
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <Share2 size={20} />
                        اشتراک‌گذاری داستان
                    </button>
                </div>

                {/* Story Content */}
                <div className="space-y-8">
                    {storyImage && (
                        <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
                            <img
                                src={storyImage}
                                alt="داستان تصویری"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}

                    {storyAudio && (
                        <>
                            <audio
                                ref={audioRef}
                                src={storyAudio}
                                preload="auto"
                                className="hidden"
                            />
                            <button
                                onClick={toggleAudio}
                                className="mx-auto block px-6 py-2 rounded-full bg-white/10 
                         hover:bg-white/20 transition-colors"
                            >
                                {isPlaying ? 'توقف پخش' : 'پخش روایت صوتی'}
                            </button>
                        </>
                    )}

                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg md:text-xl font-medium leading-[1.8rem] whitespace-pre-wrap">
                            {story}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 