// client/src/pages/Upload.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Import Link
import '../styles.css';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [sharedWith, setSharedWith] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); // Error state
    const { user } = useContext(AuthContext); // Access user from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            return;
        }

        // File type validation (example: allow only images and documents)
        const allowedTypes = [
            'image/jpeg', // JPEG images
            'image/png', // PNG images
            'application/pdf', // PDF documents
            'application/msword', // Microsoft Word (.doc) documents
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Microsoft Word (.docx) documents
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // Microsoft PowerPoint (.pptx) presentations
            'text/csv' // CSV files
        ];
        
        if (file && !allowedTypes.includes(file.type)) {
            setError('Please upload a valid file type (JPEG, PNG, PDF, DOC, DOCX, PPT, CSV)');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('sharedWith', sharedWith); // Comma-separated usernames

        setLoading(true); // Start loading
        setError(null); // Reset error state

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            alert('File uploaded successfully');
            // Reset fields
            setFile(null);
            setDescription('');
            setCategory('');
            setSharedWith('');
        } catch (error) {
            const message = error.response?.data?.message || 'Error uploading file';
            setError(message); // Set error message
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <div className="upload-form-container">
            <h2 className="upload-form-title">Upload File</h2>
            
            {/* Back Button */}
            <Link to="/dashboard">
                <button className="back-button">← Back to Dashboard</button>
            </Link>
            
            <form onSubmit={handleSubmit} className="form">
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                    className="form-input"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                />
                <input
                    type="text"
                    placeholder="Enter usernames of peers to share"
                    value={sharedWith}
                    onChange={(e) => setSharedWith(e.target.value)}
                    className="form-input"
                />
                <button type="submit" className="form-button" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload'}
                </button>

                {error && <p className="error-message">{error}</p>} {/* Display error message */}
            </form>
        </div>
    );
};

export default Upload;
