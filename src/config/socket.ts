export const getSocketURL = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:8081';
    }

    // Check if we're on the main domain or EB domain
    const isDorchinDomain = window.location.hostname === 'dorchin.io';

    if (isDorchinDomain) {
        return 'https://dorchin.io';
    }

    // For EB domain, use http
    return 'http://derakht.eu-central-1.elasticbeanstalk.com';
};

export const socketConfig = {
    path: '/derakht/socket.io/',
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
    secure: false // Will be automatically upgraded to secure when on https
};