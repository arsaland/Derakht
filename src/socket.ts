import { io } from 'socket.io-client';

export const socket = io(import.meta.env.PROD ? `http://localhost:8081` : 'http://localhost:8081', {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});