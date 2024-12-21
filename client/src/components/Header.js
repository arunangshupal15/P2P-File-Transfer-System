// client/src/components/Header.js
import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Icon from '../assets/logo.png'; 
import { FaSignOutAlt } from 'react-icons/fa';
import '../styles.css';
import { jwtDecode } from 'jwt-decode';
import axios from '../api/axios';
const Header = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const hideNavLinks = ['/login', '/register'];

    //const handleLogout = () => {
    //     localStorage.removeItem('token');
    //     setUser(null);
    //     navigate('/login');
    // };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            const decoded = jwtDecode(token);
            const userId = decoded.id; // Replace with the actual user ID
            const response = await axios.post(`/users/logout`, { userId });
            
            if (response.ok) {
                console.log("Logged out and files deleted successfully");
            } else {
                console.error("Logout failed");
            }
            localStorage.removeItem('token');
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };
    
    return (
        <header className="header">
            <div className="logo-container">
                <img src={Icon} alt="PeerSync Logo" className="logo" />
                <h1 className="app-name">PeerSync</h1>
            </div>
            {user && !hideNavLinks.includes(location.pathname) && (
                <nav className="nav-links">
                    <button onClick={handleLogout} className="logout-button" aria-label="Logout">
                        <FaSignOutAlt /> Logout
                    </button>
                </nav>
            )}
        </header>
    );
};

export default Header;
