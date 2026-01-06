import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            const apiUrl = window.ENV?.VITE_API_URL || import.meta.env.VITE_API_URL || 'https://tickets.vitaldigitalmedia.net/api';
            const socketUrl = apiUrl.replace(/\/api$/, ''); // Strip /api suffix

            const newSocket = io(socketUrl, {
                auth: { token }, // Pass token for auth if needed by Gateway Guard
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
