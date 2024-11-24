import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGame } from './GameContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { gameState } = useGame();

  const initSocket = useCallback(() => {
    const SOCKET_URL = import.meta.env.DEV
      ? 'http://localhost:8081'
      : window.location.origin;

    const newSocket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    setSocket(newSocket);
    return newSocket;
  }, []);

  useEffect(() => {
    const newSocket = initSocket();
    return () => {
      newSocket.close();
    };
  }, [initSocket]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);