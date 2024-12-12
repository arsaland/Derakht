import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { TreePine, Copy, Send, Share2 } from 'lucide-react';
import { RoundTransition } from '../components/RoundTransition';
import { FinalStory } from '../components/FinalStory';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSentence } from '../components/AnimatedSentence';
import { GameLobby } from '../components/GameLobby';
import { debounce } from 'lodash';
import { Toggle } from '../components/Toggle';

const debouncedTypingStart = debounce((socket, roomId) => {
  socket.emit('typing', { roomId });
}, 500);

const debouncedTypingEnd = debounce((socket, roomId) => {
  socket.emit('stopTyping', { roomId });
}, 100);

const MAX_PLAYERS = 8;

export default function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { gameState, setGameState, playerName } = useGame();
  const [sentence, setSentence] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !playerName) {
      navigate('/');
      return;
    }

    socket.on('gameState', setGameState);
    socket.on('gameError', (error) => {
      console.error('Game error:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off('gameState');
      socket.off('gameError');
      socket.emit('stopTyping', { roomId });
    };
  }, [socket, playerName, navigate, roomId]);

  const handleSubmitSentence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !sentence.trim()) return;

    // Clear typing state before submitting
    debouncedTypingEnd.cancel();
    socket.emit('stopTyping', { roomId });

    // Submit the sentence
    socket.emit('submitSentence', { roomId, sentence: sentence.trim() });
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
    'دلنشین': 'دلنشین',
    'ماجراجویی': 'ماجراجویی',
    'رازآلود': 'رازآلود',
    'ترسناک': 'ترسناک'
  };

  const isNewSentence = (index: number) => {
    return index === gameState.sentences.length - 1;
  };

  const handleTypingStart = () => {
    if (!socket) return;
    debouncedTypingStart(socket, roomId);
  };

  const handleTypingEnd = () => {
    if (!socket) return;
    debouncedTypingEnd(socket, roomId);
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.emit('typing:end', { roomId });
        debouncedTypingStart.cancel();
        debouncedTypingEnd.cancel();
      }
    };
  }, [socket, roomId]);

  if (gameState.showFinalStory) {
    navigate('/final-story', {
      state: {
        story: gameState.finalStory,
        storyImage: gameState.storyImage,
        storyAudio: gameState.storyAudio
      }
    });
    return null;
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen p-6 space-y-8">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold">اتاق بازی</h1>
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl font-bold">کد اتاق: {roomId}</span>
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
            <h2 className="text-2xl font-extrabold">بازیکنان ({gameState.players.length})</h2>
            <div className="space-y-3">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <span className="text-xl font-bold">{player.name}</span>
                  {player.isHost && (
                    <span className="text-sm opacity-60">میزبان</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost && gameState.players.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">انتخاب فضای داستان</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(THEMES).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => socket?.emit('selectTheme', { roomId, theme })}
                    className={`p-4 rounded-lg border-2 transition-colors
                      ${gameState.theme === theme
                        ? 'border-[#183715] bg-[#183715]/10'
                        : 'border-[#183715]/30 hover:border-[#183715] hover:bg-[#183715]/5'}`}
                  >
                    <div className="text-lg font-medium">{theme}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-extrabold">ویژگی‌های داستان</h2>
                <Toggle
                  enabled={gameState.features?.tts || false}
                  onChange={(enabled) => socket?.emit('toggleFeature', { roomId, feature: 'tts', enabled })}
                  label={<span className="font-medium">روایت صوتی داستان</span>}
                />
                <Toggle
                  enabled={gameState.features?.images || false}
                  onChange={(enabled) => socket?.emit('toggleFeature', { roomId, feature: 'images', enabled })}
                  label={<span className="font-medium">تصویرسازی داستان</span>}
                />
              </div>

              <button
                onClick={handleStartGame}
                disabled={!gameState.theme}
                className="block w-full text-2xl py-4 px-8 font-extrabold underline decoration-[#183715] underline-offset-4 
                         text-white hover:text-[#183715] transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                شروع بازی
              </button>
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
        storyImage={gameState.storyImage}
        storyAudio={gameState.storyAudio}
      />

      <div className="min-h-screen flex flex-col">
        <div className="flex-1 p-6 pb-40 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-4">
              {gameState.sentences.map((text, i) => {
                const player = gameState.players.find(p => p.sentenceIndices?.includes(i));
                const isAIGenerated = i === 0 || gameState.aiSentenceIndices?.includes(i);
                const isLatest = isNewSentence(i);

                return (
                  <div
                    key={i}
                    className="flex gap-3 text-base leading-relaxed items-start py-2"
                  >
                    <span className="whitespace-nowrap font-bold min-w-[100px] text-right text-[#183715]">
                      {isAIGenerated ? "هوش‌یار:" : player?.name + ":"}
                    </span>
                    {isLatest ? (
                      <AnimatedSentence text={text} />
                    ) : (
                      <p className="flex-1">{text}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {gameState.typingPlayer && gameState.typingPlayer !== socket?.id && (
              <div className="flex gap-3 text-base leading-relaxed items-start py-2">
                <span className="whitespace-nowrap font-bold min-w-[100px] text-left text-[#183715]">
                  {gameState.players.find(p => p.id === gameState.typingPlayer)?.name}:
                </span>
                <p className="flex-1 text-gray-400 animate-pulse">
                  در حال نوشتن...
                </p>
              </div>
            )}

            {gameState.currentTurn === 'ai' && (
              <div className="flex gap-3 text-base leading-relaxed items-start py-2">
                <span className="whitespace-nowrap font-medium min-w-[100px] text-left text-gray-400">
                  هوش‌یار:
                </span>
                <p className="flex-1 text-gray-400 animate-pulse">
                  در حال نوشتن...
                </p>
              </div>
            )}

            {gameState.isProcessing && (
              <p className="text-xl opacity-60 animate-pulse">
                هوش‌یار در حال پردازش داستان است...
              </p>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 right-0 left-0">
          <div className="flex items-center justify-between px-4 py-2 text-sm opacity-60 bg-black/50 backdrop-blur border-t border-white/5">
            <span>اتاق: {roomId}</span>
            <span>نوبت: {
              gameState.currentTurn === 'ai'
                ? 'هوش‌یار'
                : gameState.players.find(p => p.id === gameState.currentTurn)?.name
            }</span>
          </div>

          {isMyTurn && !gameState.isProcessing && !gameState.showFinalStory && (
            <form
              onSubmit={handleSubmitSentence}
              className="p-4 bg-black/90 backdrop-blur border-t border-white/10"
            >
              <div className="max-w-2xl mx-auto flex gap-3">
                <input
                  value={sentence}
                  onChange={(e) => {
                    setSentence(e.target.value);
                    handleTypingStart();
                  }}
                  onBlur={handleTypingEnd}
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
      </div>

      {gameState.roundTransition && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur z-50">
          <div className="text-center space-y-8">
            <h2 className="text-7xl font-extrabold">
              {gameState.round === 1 && 'مقدمه'}
              {gameState.round === 2 && 'گسترش'}
              {gameState.round === 3 && 'اوج'}
              {gameState.round === 4 && 'پایان'}
            </h2>
            <p className="text-xl text-white/60">
              {gameState.round === 1 ? 'داستان را شروع کنید' : null}
              {gameState.round === 2 ? 'داستان را گسترش دهید' : null}
              {gameState.round === 3 ? 'داستان را به اوج برسانید' : null}
              {gameState.round === 4 ? 'داستان را به پایان برسانید' : null}
            </p>
          </div>
        </div>
      )}
    </>
  );
}