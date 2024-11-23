export const getSocketURL = () =>
    import.meta.env.DEV
        ? 'http://localhost:8081'
        : (import.meta.env.VITE_SOCKET_URL || window.location.origin);

export const socketConfig = {
    path: '/socket.io/',
    transports: ['polling', 'websocket'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000
};