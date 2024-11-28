export const getSocketURL = () => {
    // Check if we're in development
    if (import.meta.env.DEV) {
        return 'http://localhost:8081';
    }

    // In production, always use the current origin (dorchin.io)
    return window.location.origin;
};

export const socketConfig = {
    path: '/derakht/socket.io/',
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000
};