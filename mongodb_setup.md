# MongoDB Local Setup Guide

Follow these instructions to set up MongoDB on your local machine for the Social Media App.

## 1. Installation

### Windows
1. Download the **MongoDB Community Server** MSI from the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Run the installer and choose "Complete" setup.
3. **Important**: Ensure "Install MongoDB as a Service" is checked.
4. Install **MongoDB Compass** (optional but recommended) when prompted.

### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
```

### Linux (Ubuntu)
Refer to the [official Ubuntu installation guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/).

## 2. Starting MongoDB

### Windows
1. Open **Services** (services.msc).
2. Find **MongoDB Server**.
3. Right-click and select **Start**.

### macOS
```bash
brew services start mongodb-community@7.0
```

### Linux
```bash
sudo systemctl start mongod
```

## 3. Verification
To verify MongoDB is running, open your terminal and run:
```bash
mongosh
```
If you see a `test>` prompt, it's working!

## 4. Connection Troubleshooting
- **Error: ECONNREFUSED**: This means the MongoDB service isn't running. Start it using the commands above.
- **Port 27017**: Ensure no other application is using this port.
- **Firewall**: Ensure your local firewall isn't blocking connections to port 27017.

## 5. Connecting the App
Ensure your `backend/.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/social_media_app
```
