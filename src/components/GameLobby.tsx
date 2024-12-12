import React from 'react';
import { Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface GameLobbyProps {
  players: Player[];
  roomCode: string;
  isHost: boolean;
  onStartGame: () => void;
}

export function GameLobby({ players, roomCode, isHost, onStartGame }: GameLobbyProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">درخت</h1>
        <p className="text-gray-400">کد اتاق: {roomCode}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={20} />
          <span>بازیکنان ({players.length})</span>
        </div>

        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 border-b border-gray-800"
            >
              <span>{player.name}</span>
              {player.isHost && (
                <span className="text-sm text-gray-400">میزبان</span>
              )}
            </div>
          ))}
        </div>

        {isHost && (
          <button
            onClick={onStartGame}
            className="block w-full text-2xl py-4 px-8 font-extrabold underline decoration-[#183715] underline-offset-4 
                       text-white hover:text-[#183715] transition-colors duration-200"
          >
            شروع بازی
          </button>
        )}
      </div>
    </div>
  );
}