// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                
                // Check if token is expired
                if (decoded.exp > currentTime) {
                    setUser({ 
                        id: decoded.id, 
                        username: decoded.username 
                    });
                } else {
                    // Token expired, remove it
                    console.log('Token expired');
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            logout,
            isLoading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};