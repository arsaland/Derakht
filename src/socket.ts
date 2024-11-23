import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
    import.meta.env.DEV
        ? `http://${window.location.hostname}:8081`
        : '/'
);

export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
});