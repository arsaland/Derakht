import { Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import Host from './pages/Host';
import Join from './pages/Join';
import Game from './pages/Game';

export default function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<Host />} />
          <Route path="/join" element={<Join />} />
          <Route path="/game/:roomId" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GameProvider>
    </SocketProvider>
  );
}