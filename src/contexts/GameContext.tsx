import { createContext, useContext, useState } from 'react';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface GameState {
  players: Player[];
  currentTurn: string;
  sentences: string[];
  isProcessing: boolean;
  theme?: string;
  typingPlayer?: string;
  round: number;
  showRoundTransition: boolean;
  features: {
    tts: boolean;
    images: boolean;
  };
}

interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

const GameContext = createContext<GameContextType>({
  gameState: {
    players: [],
    currentTurn: '',
    sentences: [],
    isProcessing: false,
    theme: '',
    round: 0,
    showRoundTransition: false,
    features: {
      tts: false,
      images: false
    }
  },
  setGameState: () => { },
  playerName: '',
  setPlayerName: () => { }
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentTurn: '',
    sentences: [],
    isProcessing: false,
    theme: '',
    round: 0,
    showRoundTransition: false,
    features: {
      tts: false,
      images: false
    }
  });
  const [playerName, setPlayerName] = useState('');

  return (
    <GameContext.Provider value={{ gameState, setGameState, playerName, setPlayerName }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);