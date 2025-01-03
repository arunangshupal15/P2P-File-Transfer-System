# P2P File Transfer System

### Installation & Setup

1. Clone the repository
```bash
git clone [repository-url]
cd [project-directory]
```

2. Server Setup
```bash
# Install server dependencies
cd server
npm install

# Create .env file in server directory
# Add these lines to .env:
MONGO_URI=your_mongodb_connection_string
PORT=5001
```

3. Client Setup
```bash
# Install client dependencies
cd client
npm install
```

4. Running the Application
```bash
# Terminal 1 - Start the backend server
cd server
npm start

# Terminal 2 - Start the React development server
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Features
- User Authentication (Register/Login)
- File Upload
- File Management Dashboard
- P2P File Transfer
- Protected Routes

