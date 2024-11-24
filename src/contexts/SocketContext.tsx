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
      transports: ['polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      withCredentials: false,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*"
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnected(true);

      if (!newSocket.io.opts.transports.includes('websocket')) {
        newSocket.io.opts.transports = ['polling', 'websocket'];
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (newSocket.io.opts.transports.includes('websocket')) {
        console.log('Falling back to polling transport');
        newSocket.io.opts.transports = ['polling'];
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);

      if (reason === 'transport close') {
        console.log('Attempting immediate reconnection...');
        newSocket.connect();
      }
    });

    newSocket.io.on('reconnect', (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts');
    });

    newSocket.io.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
    });

    setSocket(newSocket);
    return newSocket;
  }, [gameState.currentTurn]);

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