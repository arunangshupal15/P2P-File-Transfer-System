// client/src/pages/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import '../styles.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`/users/login`, { username, password });
            const token = res.data.token;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            setUser({ 
                id: decoded.id, 
                username: decoded.username 
            });
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Welcome Back</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>
                    <button type="submit" className="login-button">
                        <FaSignInAlt className="button-icon" />
                        Login
                    </button>
                </form>
                <p className="login-footer">
                    Don't have an account? <Link to="/register" className="login-link">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;