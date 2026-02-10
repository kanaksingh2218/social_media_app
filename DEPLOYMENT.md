# Deployment & Setup Guide

## Prerequisites
- Node.js v18+
- MongoDB Instance (Atlas or Local)
- Socket.IO compatible environment

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/social_media_app
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Production Build

### Backend
1.  **Build**: `npx tsc` (compiles TypeScript to JavaScript in `/dist`)
2.  **Start**: `node dist/server.js`
3.  **Process Manager**: Use `pm2` for production resilience.
    ```bash
    pm2 start dist/server.js --name "social-backend"
    ```

### Frontend
1.  **Build**: `npm run build`
2.  **Start**: `npm start` (Runs on port 3000 by default)

## Nginx Reverse Proxy (Recommended)
If deploying on a VPS (DigitalOcean, AWS), use Nginx to correctly route requests.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Common Issues
- **CORS Errors**: Ensure `FRONTEND_URL` in backend `.env` matches the actual frontend domain perfectly.
- **Socket Connection**: Ensure `/socket.io/` is proxied correctly with Upgrade headers.
- **Images**: If using local uploads, ensure `backend/uploads` directory exists and is served statically.
