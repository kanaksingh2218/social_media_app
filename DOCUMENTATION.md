# Social Media Application Documentation

This document provides a comprehensive guide to the Social Media Application, including its architecture, technology stack, setup instructions, and feature overview. The project consists of a **Backend** (Node.js/Express) and a **Frontend** (Next.js/React).

## 1. Project Overview

The Social Media Application is a full-stack platform that allows users to connect, share content, and interact in real-time. Key functionalities include:
- **User Authentication**: Secure Signup, Login, and Password Reset flows.
- **Social Feed**: Create posts (text/images), like, and comment on posts.
- **Profile Management**: customizable user profiles, avatars, and story highlights.
- **Connections**: Follow/Unfollow system and Friend Request management.
- **Real-time Chat**: Instant messaging using Socket.io.
- **Notifications**: Real-time alerts for interactions.
- **Search**: Find other users on the platform.

---

## 2. Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Real-time**: Socket.io
- **File Uploads**: Multer
- **Email**: Nodemailer

### Frontend
- **Framework**: Next.js (App Router)
- **Library**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Real-time Client**: Socket.io-client
- **HTTP Client**: Axios

---

## 3. Project Structure

```
social_media_app/
├── backend/                # Node.js/Express Server
│   ├── Authentication/     # Auth routes & controllers
│   ├── Chat/               # Chat logic
│   ├── Feed/               # Post management
│   ├── Friends/            # Friend request logic
│   ├── Notifications/      # Notification system
│   ├── Profile/            # Profile management
│   ├── Search/             # User search
│   ├── shared/             # Config, types, utilities
│   ├── uploads/            # Static file storage
│   └── server.ts           # Entry point
│
└── frontend/               # Next.js Application
    ├── app/                # App Router pages
    ├── context/            # React Context (Auth, Socket)
    ├── services/           # API calls
    ├── shared/             # Shared types/utils
    └── public/             # Static assets
```

---

## 4. Prerequisites

Before running the application, ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **npm** (Node Package Manager)
- **MongoDB** (Local instance or Atlas connection string)

---

## 5. Installation & Setup

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the `backend` directory with the following content:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/social-media
    JWT_SECRET=your_jwt_secret_key_here
    JWT_EXPIRE=7d
    NODE_ENV=development
    FRONTEND_URL=http://localhost:3000
    
    # SMTP Configuration (for forgot password emails)
    SMTP_EMAIL=your_email@gmail.com
    SMTP_PASSWORD=your_app_password
    ```

4.  Start the Development Server:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the `frontend` directory:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
    ```

4.  Start the Development Server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

---

## 6. Key Features & API Endpoints

### Authentication
- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `POST /api/auth/forgot-password`: JSON-based password reset request.

### Feed
- `POST /api/posts`: Create a new post.
- `GET /api/posts/feed`: Retrieve the user's feed.
- `POST /api/posts/like`: Like/Unlike a post.
- `POST /api/posts/comment`: Add a comment.

### Profile
- `GET /api/profile/:username`: Get user profile.
- `PUT /api/profile/update`: Update profile details.
- `POST /api/profile/upload-avatar`: Upload profile picture.
- `POST /api/profile/follow`: Follow a user.

### Friends
- `POST /api/friends/send`: Send a friend request.
- `POST /api/friends/accept`: Accept a friend request.
- `GET /api/friends/list`: Get list of friends.

### Real-time Chat
- Uses Socket.io for instant message delivery.
- REST API `GET /api/chat/history/:userId` to fetch previous messages.

---

## 7. Troubleshooting

- **MongoDB Connection Error**: Ensure your MongoDB service is running locally (`mongod`) or your Atlas URI is correct.
- **CORS Issues**: Check if `FRONTEND_URL` in backend `.env` matches your frontend's running port.
- **Image Uploads Not Working**: Ensure the `backend/uploads` directory exists.
- **Socket Connection Failed**: Verify `NEXT_PUBLIC_SOCKET_URL` points to the backend server.

