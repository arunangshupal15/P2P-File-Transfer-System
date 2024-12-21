// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Use `react-dom/client` for React 18
import App from './App';
import { AuthProvider } from './context/AuthContext';
import 'normalize.css';
import './styles.css';

// Create a root element to render the application
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
