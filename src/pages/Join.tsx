import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { TreePine, ArrowRight } from 'lucide-react';

export default function Join() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { setPlayerName } = useGame();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim() || !socket) return;

    setPlayerName(name);
    socket.emit('joinGame', { playerName: name, roomId }, (response: { success: boolean }) => {
      if (response.success) {
        navigate(`/game/${roomId}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12">
      <div className="text-center space-y-4">
        <TreePine size={48} className="mx-auto" />
        <h1 className="text-3xl font-bold">پیوستن به بازی</h1>
      </div>

      <form onSubmit={handleJoin} className="w-full max-w-sm space-y-8">
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام شما"
            className="text-xl"
            autoFocus
          />
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="کد اتاق"
            className="text-xl"
          />
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            className="w-full py-4 text-xl font-medium text-black bg-white 
                     hover:bg-gray-100 transition-colors duration-200 rounded-lg"
          >
            پیوستن به بازی
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 text-lg opacity-60 hover:opacity-100 
                     transition-opacity duration-200 flex items-center justify-center gap-2"
          >
            <ArrowRight size={20} />
            <span>بازگشت</span>
          </button>
        </div>
      </form>
    </div>
  );
}