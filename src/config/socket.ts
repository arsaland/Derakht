export const getSocketURL = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:8081';
    }
    return 'https://dorchin.io/derakht';
};

export const socketConfig = {
    path: '/derakht/socket.io/',
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: true
};