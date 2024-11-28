export const getSocketURL = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:8081';
    }

    // For production, use relative path to work with both direct EB URL and game hub subdirectory
    return window.location.origin;
};

export const socketConfig = {
    path: '/derakht/socket.io/',
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
    secure: true // Enable secure connection in production
};