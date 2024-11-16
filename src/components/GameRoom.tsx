import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Story {
  sentences: string[];
  currentTurn: string;
  isProcessing: boolean;
}

interface GameRoomProps {
  story: Story;
  playerId: string;
  onSubmitSentence: (sentence: string) => void;
}

export function GameRoom({ story, playerId, onSubmitSentence }: GameRoomProps) {
  const [sentence, setSentence] = useState('');
  const isPlayerTurn = story.currentTurn === playerId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sentence.trim() && isPlayerTurn) {
      onSubmitSentence(sentence.trim());
      setSentence('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {story.sentences.map((text, index) => (
            <p
              key={index}
              className={`text-lg leading-relaxed ${index === 0 ? 'text-gray-400' : 'text-white'
                }`}
            >
              {text}
            </p>
          ))}

          {story.isProcessing && (
            <p className="text-gray-400 animate-pulse">
              هوش‌یار در حال پردازش داستان است...
            </p>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-800 bg-black p-4"
      >
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            disabled={!isPlayerTurn || story.isProcessing}
            placeholder={
              isPlayerTurn
                ? 'جمله‌ی خود را بنویسید...'
                : 'منتظر نوبت خود باشید...'
            }
            className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg
                     placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
          />
          <button
            type="submit"
            disabled={!isPlayerTurn || !sentence.trim() || story.isProcessing}
            className="p-2 text-white rounded-lg transition-opacity
                     disabled:opacity-50 enabled:hover:opacity-80"
          >
            <Send size={24} />
          </button>
        </div>
      </form>
    </div>
  );
}