import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedSentenceProps {
    text: string;
    className?: string;
}

export function AnimatedSentence({ text, className = "" }: AnimatedSentenceProps) {
    const [words, setWords] = useState<string[]>([]);

    useEffect(() => {
        setWords(text.split(/\s+/));
    }, [text]);

    return (
        <motion.p
            className={`flex-1 ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    className="inline-block mx-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        ease: "easeOut"
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.p>
    );
}
