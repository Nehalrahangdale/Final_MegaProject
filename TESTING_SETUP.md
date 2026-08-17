// Backend Test Setup - package.json scripts
// Add these to your backend/package.json under "scripts"

{
  "name": "backend",
  "version": "1.0.0",
  "description": "Smart Parking Backend",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:controllers": "jest __tests__/controllers",
    "test:models": "jest __tests__/models",
    "test:middleware": "jest __tests__/middleware",
    "test:integration": "jest __tests__/integration",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cloudinary": "^1.41.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^8.18.0",
    "multer": "^2.2.0",
    "multer-storage-cloudinary": "^4.0.0",
    "razorpay": "^2.9.8",
    "streamifier": "^0.1.1",
    "validator": "^13.15.35"
  },
  "devDependencies": {
    "nodemon": "^3.1.10",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "mongodb-memory-server": "^9.1.6",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
