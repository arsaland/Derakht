import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { Share2, Copy, Send } from 'lucide-react';
import { RoundTransition } from '../components/RoundTransition';
import { FinalStory } from '../components/FinalStory';

export default function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { gameState, setGameState, playerName } = useGame();
  const [sentence, setSentence] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!socket || !playerName) {
      navigate('/');
      return;
    }

    socket.on('gameState', setGameState);
    socket.on('gameError', () => navigate('/'));

    return () => {
      socket.off('gameState');
      socket.off('gameError');
    };
  }, [socket, playerName, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !sentence.trim()) return;
    socket.emit('submitSentence', { roomId, sentence });
    setSentence('');
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('startGame', { roomId });
  };

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareRoomCode = async () => {
    try {
      await navigator.share({
        title: 'پیوستن به بازی درخت',
        text: `برای پیوستن به بازی درخت از کد ${roomId} استفاده کنید`,
      });
    } catch (err) {
      copyRoomCode();
    }
  };

  const isHost = gameState.players.find(p => p.id === socket?.id)?.isHost;
  const isMyTurn = gameState.currentTurn === socket?.id;
  const gameStarted = gameState.round > 0;

  const THEMES = {
    'دلنشین': '🌸',
    'ماجراجویی': '🗺️',
    'رازآلود': '🔍',
    'ترسناک': '👻'
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen p-6 space-y-8">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">لابی بازی</h1>
            <div className="flex items-center justify-center gap-4">
              <span className="text-xl opacity-60">کد اتاق: {roomId}</span>
              <button onClick={shareRoomCode} className="opacity-60 hover:opacity-100">
                <Share2 size={24} />
              </button>
              <button onClick={copyRoomCode} className="opacity-60 hover:opacity-100">
                <Copy size={24} />
              </button>
            </div>
            {copied && <div className="text-sm opacity-60">کد اتاق کپی شد</div>}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">بازیکنان ({gameState.players.length})</h2>
            <div className="space-y-3">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <span className="text-xl">{player.name}</span>
                  {player.isHost && (
                    <span className="text-sm opacity-60">میزبان</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <div className="space-y-4">
              <h2 className="text-2xl">انتخاب فضای داستان</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(THEMES).map(([theme, emoji]) => (
                  <button
                    key={theme}
                    onClick={() => socket?.emit('selectTheme', { roomId, theme })}
                    className={`p-4 rounded-lg border-2 transition-colors
                      ${gameState.theme === theme
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30'}`}
                  >
                    <div className="text-2xl mb-2">{emoji}</div>
                    <div className="text-lg">{theme}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleStartGame}
                disabled={!gameState.theme}
                className="w-full py-4 text-xl font-medium text-black bg-white 
                         hover:bg-gray-100 transition-colors duration-200 rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                شروع بازی
              </button>
            </div>
          )}

          {!isHost && gameState.theme && (
            <div className="text-center space-y-2">
              <div className="text-3xl">{THEMES[gameState.theme]}</div>
              <div className="text-xl">فضای داستان: {gameState.theme}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <RoundTransition
        round={gameState.round}
        show={gameState.showRoundTransition}
      />

      <FinalStory
        show={gameState.showFinalStory}
        story={gameState.finalStory}
      />

      <div className="min-h-screen flex flex-col">
        <div className="flex-1 p-6 pb-32 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between opacity-60 text-lg">
              <span>اتاق: {roomId}</span>
              <span>نوبت: {gameState.players.find(p => p.id === gameState.currentTurn)?.name}</span>
            </div>

            <div className="space-y-4">
              {gameState.sentences.map((text, i) => (
                <p key={i} className="text-xl leading-relaxed">{text}</p>
              ))}
            </div>

            {gameState.isProcessing && (
              <p className="text-xl opacity-60 animate-pulse">
                هوش مصنوعی در حال پردازش داستان است...
              </p>
            )}
          </div>
        </div>

        {isMyTurn && !gameState.isProcessing && !gameState.showFinalStory && (
          <form
            onSubmit={handleSubmit}
            className="fixed bottom-0 right-0 left-0 p-4 bg-black/90 backdrop-blur border-t border-white/10"
          >
            <div className="max-w-2xl mx-auto flex gap-3">
              <input
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="جمله‌ی خود را بنویسید..."
                className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-lg"
                autoFocus
              />
              <button
                type="submit"
                disabled={!sentence.trim()}
                className="p-3 text-white rounded-lg transition-opacity
                         disabled:opacity-30 enabled:hover:opacity-80"
              >
                <Send size={28} />
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}