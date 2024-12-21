// client/src/pages/Search.js
import React, { useState } from 'react';
import axios from '..api/axios';
import '../styles.css';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            const res = await axios.get(`/files/search?query=${encodeURIComponent(query)}`); // Updated API URL
            setResults(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch search results. Please try again later.'); // Improved error handling
        } finally {
            setLoading(false); // End loading
        }
    };

    const handleDownload = async (id, originalName) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/files/download/${id}`, { responseType: 'blob' }); // Updated API URL
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName);
            document.body.appendChild(link);
            link.click();
            link.remove(); // Clean up
        } catch (error) {
            console.error(error);
            alert('Failed to download file. Please try again later.'); // Improved error handling
        }
    };

    return (
        <div>
            <h2>Search Files</h2>
            <form onSubmit={handleSearch} className="form">
                <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <ul className="file-list">
                    {results.map(file => (
                        <li key={file._id} className="file-item">
                            {file.originalName} - {file.description} - {file.category} - Uploaded by {file.uploadedBy.username}
                            <button onClick={() => handleDownload(file._id, file.originalName)}>Download</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Search;
