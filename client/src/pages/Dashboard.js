// client/src/pages/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import uploadIcon from '../assets/Upload.png'; // Import upload.png
import showIcon from '../assets/show.png';     // Import show.png
import '../styles.css';                        // Import your CSS

const Dashboard = () => {
    return (
        <div className="dashboard container">
            <h1>Welcome to PeerSync</h1>
            <div className="dashboard-options">
                <Link to="/upload" className="dashboard-button">
                    <img src={uploadIcon} alt="Upload File Icon" className="button-icon" />
                    Upload File
                </Link>
                <Link to="/files" className="dashboard-button">
                    <img src={showIcon} alt="View Shared Files Icon" className="button-icon" />
                    View Shared Files
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;

