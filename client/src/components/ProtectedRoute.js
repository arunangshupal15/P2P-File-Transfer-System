// client/src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext); // Access user from context
    if(user){
        return children;
    }
    else
        return <Navigate to="/dashboard" />;
};

export default ProtectedRoute;