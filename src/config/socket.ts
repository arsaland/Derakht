export const getSocketURL = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:8081';
    }
    // In production, always use dorchin.io
    return 'https://dorchin.io';
};

export const socketConfig = {
    path: '/derakht/socket.io/',
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000
};