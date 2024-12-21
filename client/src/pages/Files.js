// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
// import '../styles.css';

// const Files = () => {
//     const [files, setFiles] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [isSearching, setIsSearching] = useState(false);
//     const { user } = useContext(AuthContext);

//     useEffect(() => {
//         const fetchFiles = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (!token) {
//                     alert('Please login first');
//                     return;
//                 }
//                 const res = await axios.get(`${process.env.REACT_APP_API_URL}/files`, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 });
//                 setFiles(res.data);
//             } catch (error) {
//                 console.error('Error fetching files:', error);
//                 alert('Failed to fetch files');
//             }
//         };
//         fetchFiles();
//     }, [user]);

//     const handleDownload = async (id, originalName) => {
//         try {
//             const token = localStorage.getItem('token');
//             const res = await axios.get(`${process.env.REACT_APP_API_URL}/files/download/${id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 },
//                 responseType: 'blob'
//             });
//             const url = window.URL.createObjectURL(new Blob([res.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', originalName);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//         } catch (error) {
//             console.error('Error downloading file:', error);
//             alert('Failed to download file');
//         }
//     };

//     const handleSearch = async (e) => {
//         e.preventDefault();
//         if (searchQuery.trim() === '') {
//             alert('Please enter a search query.');
//             return;
//         }
//         try {
//             setIsSearching(true);
//             const token = localStorage.getItem('token');
//             const res = await axios.get(`${process.env.REACT_APP_API_URL}/files/search?query=${encodeURIComponent(searchQuery)}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             setFiles(res.data);
//             setIsSearching(false);
//         } catch (error) {
//             console.error('Error searching files:', error);
//             alert('Failed to search files');
//             setIsSearching(false);
//         }
//     };

//     const handleClearSearch = async () => {
//         setSearchQuery('');
//         try {
//             const token = localStorage.getItem('token');
//             const res = await axios.get(`${process.env.REACT_APP_API_URL}/files`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             setFiles(res.data);
//         } catch (error) {
//             console.error('Error fetching files:', error);
//             alert('Failed to fetch files');
//         }
//     };

//     return (
//         <div className="container files-container">
//             <h2>Shared Files</h2>

//             <Link to="/dashboard">
//                 <button className="back-button">← Back to Dashboard</button>
//             </Link>

//             <form onSubmit={handleSearch} className="search-form">
//                 <input
//                     type="text"
//                     placeholder="Search by name, type, or description..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="search-input"
//                 />
//                 <button type="submit" className="search-button" disabled={isSearching}>
//                     {isSearching ? 'Searching...' : 'Search'}
//                 </button>
//                 {isSearching === false && searchQuery.trim() !== '' && (
//                     <button type="button" onClick={handleClearSearch} className="clear-button">
//                         Clear Search
//                     </button>
//                 )}
//             </form>

//             {files.length === 0 ? (
//                 <p>No files available.</p>
//             ) : (
//                 <ul className="file-list">
//                     {files.slice().reverse().map(file => (
//                         <li key={file._id} className="file-item">
//                             <div className="file-details">
//                                 <strong>{file.originalName}</strong>
//                                 <span>{file.description}</span>
//                                 <span>Category: {file.category}</span>
//                                 <span>Uploaded by: {file.uploadedBy.username}</span>

//                                 {file.sharedWith && file.sharedWith.length > 0 && (
//                                     <div className="shared-with">
//                                         <strong>Shared With:</strong>
//                                         <ul>
//                                             {file.sharedWith.map((sw, index) => (
//                                                 <li key={index}>
//                                                     {sw.user.username}
//                                                     <small>Sent at: {new Date(sw.sentAt).toLocaleString()}</small>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                 )}
//                             </div>
//                             <button onClick={() => handleDownload(file._id, file.originalName)} className="button">Download</button>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

// export default Files;

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles.css';

const Files = () => {
    const [files, setFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [onlinePeers, setOnlinePeers] = useState([]);
    const [peerError, setPeerError] = useState(null);
    const { user } = useContext(AuthContext);

    // Fetch files
    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                return;
            }
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFiles(res.data);
        } catch (error) {
            console.error('Error fetching files:', error);
            alert('Failed to fetch files');
        }
    };

    // Discover peers
    const discoverPeers = async () => {
        try {
            setPeerError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                setPeerError('No authentication token found');
                return;
            }

            // Log the token contents (be careful not to do this in production)
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            console.log('Token User Details:', {
                username: decodedToken.username,
                userId: decodedToken.userId
            });

            const res = await axios.get(`${process.env.REACT_APP_API_URL}/peers/discover`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Discover Peers Response:', {
                data: res.data,
                status: res.status
            });
            setOnlinePeers(res.data);
        } catch (error) {
            console.error('Peer discovery error:', error);
            setPeerError(
                error.response?.data?.message || 
                error.message || 
                'Failed to discover peers'
            );
        }
    };

    // Combined effect for files and peers
    useEffect(() => {
        if (user) {
            fetchFiles();
            discoverPeers();

            // Periodic discovery
            const filesInterval = setInterval(fetchFiles, 60000);
            const peersInterval = setInterval(discoverPeers, 30000);

            return () => {
                clearInterval(filesInterval);
                clearInterval(peersInterval);
            };
        }
    }, [user]);

    const handleDownload = async (id, originalName) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/files/download/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim() === '') {
            alert('Please enter a search query.');
            return;
        }
        try {
            setIsSearching(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/files/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFiles(res.data);
            setIsSearching(false);
        } catch (error) {
            console.error('Error searching files:', error);
            alert('Failed to search files');
            setIsSearching(false);
        }
    };

    const handleClearSearch = async () => {
        setSearchQuery('');
        fetchFiles();
    };

    return (
        <div className="container files-container">
            <h2>Shared Files</h2>

            <Link to="/dashboard">
                <button className="back-button">← Back to Dashboard</button>
            </Link>

            {/* Online Peers Section */}
            <div className="online-peers-section">
                <h3>Online Peers</h3>
                <button 
                    onClick={discoverPeers} 
                    className="discover-peers-button"
                >
                    Refresh Peers
                </button>

                {peerError && (
                    <div className="peer-error-message">
                        <p>Error: {peerError}</p>
                    </div>
                )}

                {!peerError && onlinePeers.length === 0 ? (
                    <p>No online peers found.</p>
                ) : (
                    <div className="peers-grid">
                        {onlinePeers.map((peer, index) => (
                            <div key={index} className="peer-card">
                                <div className="peer-username">{peer.username}</div>
                                <div className="peer-ip">{peer.ip}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search by name, type, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
                {isSearching === false && searchQuery.trim() !== '' && (
                    <button type="button" onClick={handleClearSearch} className="clear-button">
                        Clear Search
                    </button>
                )}
            </form>

            {files.length === 0 ? (
                <p>No files available.</p>
            ) : (
                <ul className="file-list">
                    {files.slice().reverse().map(file => (
                        <li key={file._id} className="file-item">
                            <div className="file-details">
                                <strong>{file.originalName}</strong>
                                <span>{file.description}</span>
                                <span>Category: {file.category}</span>
                                <span>Uploaded by: {file.uploadedBy.username}</span>

                                {file.sharedWith && file.sharedWith.length > 0 && (
                                    <div className="shared-with">
                                        <strong>Shared With:</strong>
                                        <ul>
                                            {file.sharedWith.map((sw, index) => (
                                                <li key={index}>
                                                    {sw.user.username}
                                                    <small>Sent at: {new Date(sw.sentAt).toLocaleString()}</small>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => handleDownload(file._id, file.originalName)} className="button">Download</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Files;