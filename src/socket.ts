import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV
    ? `http://${window.location.hostname}:3000`  // Development
    : '/';  // Production

export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
});