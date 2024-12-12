import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { TreePine, ArrowRight } from 'lucide-react';

export default function Host() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { setPlayerName } = useGame();
  const [name, setName] = useState('');

  const handleHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !socket) return;

    setPlayerName(name);
    socket.emit('createGame', { playerName: name }, (response: { roomId: string }) => {
      navigate(`/game/${response.roomId}`);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12">
      <div className="text-center space-y-4">
        <TreePine size={48} className="mx-auto" />
        <h1 className="text-3xl font-bold">میزبانی بازی جدید</h1>
      </div>

      <form onSubmit={handleHost} className="w-full max-w-sm">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام شما"
          className="text-xl w-full mb-12"
          autoFocus
        />

        <nav className="space-y-6 text-center">
          <button
            type="submit"
            className="block w-full text-2xl py-4 px-8 font-extrabold underline decoration-[#183715] underline-offset-4 
                     text-white hover:text-[#183715] transition-colors duration-200"
          >
            شروع بازی
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="block w-full text-xl py-3 px-6 font-extrabold underline decoration-[#183715] underline-offset-4 
                     text-white/60 hover:text-[#183715] transition-colors duration-200"
          >
            بازگشت
          </button>
        </nav>
      </form>
    </div>
  );
}