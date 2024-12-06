import { io } from 'socket.io-client';

export const socket = io(import.meta.env.PROD ? window.location.origin : 'http://localhost:8081', {
  path: '/socket.io/',
});