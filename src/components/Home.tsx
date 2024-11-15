import React, { useState } from 'react';
import { TreePine } from 'lucide-react';

interface HomeProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (roomCode: string, playerName: string) => void;
}

export function Home({ onCreateGame, onJoinGame }: HomeProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    if (isJoining) {
      onJoinGame(roomCode.trim(), playerName.trim());
    } else {
      onCreateGame(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <TreePine size={48} className="mx-auto" />
          <h1 className="text-4xl font-bold">درخت</h1>
          <p className="text-gray-400">داستان‌سرایی مشارکتی با هوش مصنوعی</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="نام خود را وارد کنید"
            className="w-full bg-transparent border-b border-gray-800 px-4 py-2
                     placeholder-gray-600 focus:outline-none focus:border-white"
          />

          {isJoining && (
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="کد اتاق را وارد کنید"
              className="w-full bg-transparent border-b border-gray-800 px-4 py-2
                       placeholder-gray-600 focus:outline-none focus:border-white"
            />
          )}

          <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-3 text-lg font-medium text-black bg-white
                       hover:bg-gray-100 transition-colors duration-200"
            >
              {isJoining ? 'پیوستن به بازی' : 'ایجاد بازی جدید'}
            </button>

            <button
              type="button"
              onClick={() => setIsJoining(!isJoining)}
              className="w-full py-2 text-sm text-gray-400 hover:text-white
                       transition-colors duration-200"
            >
              {isJoining ? 'ایجاد بازی جدید' : 'پیوستن به بازی موجود'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}