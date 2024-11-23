import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
    import.meta.env.DEV
        ? `http://${window.location.hostname}:8081`
        : window.location.origin
);

export const socket = io(SOCKET_URL, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});