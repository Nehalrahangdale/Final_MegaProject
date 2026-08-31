# 🚗 Smart Parking AI

A full-stack smart parking management platform designed to make parking discovery, slot management, booking, payments, and administration easier through a modern web application.

## ✨ Highlights

- 🔐 JWT-based authentication and role-based authorization
- 👤 User and parking-owner workflows
- 🅿️ Parking and slot management
- 📅 Parking slot booking
- 💳 Payment integration
- ⭐ Reviews and ratings
- 🔔 Notifications
- 🛠️ Admin management features
- ☁️ Cloud media support
- 📱 Responsive frontend experience

## 🧩 Architecture

```text
Frontend
   │
   │ REST API requests
   ▼
Express / Node.js Backend
   │
   ├── Routes
   ├── Controllers
   ├── Middleware
   ├── Services
   └── Models
   │
   ▼
MongoDB
```

## 🔐 Authentication Flow

The application uses **bcrypt** for password hashing and **JWT** for authenticated API requests.

```text
Register
  ↓
Password → bcrypt hash → MongoDB

Login
  ↓
Email + Password
  ↓
bcrypt.compare()
  ↓
JWT issued
  ↓
Client sends: Authorization: Bearer <token>
  ↓
JWT middleware verifies token
  ↓
User loaded into req.user
  ↓
Role authorization
  ↓
Protected resource
```

JWTs contain the user ID and role and are signed with a secret stored in environment variables. The current implementation configures a 7-day token expiry.

## 🛠️ Tech Stack

**Frontend**
- JavaScript
- React / Next.js ecosystem
- REST API integration

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

**Services / Integrations**
- Cloudinary
- Payment services

## 📁 Project Structure

```text
next-park-ai/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
└── frontend/
```

## 🔑 API Areas

| Area | Purpose |
|---|---|
| `/api/auth` | Registration and login |
| `/api/users` | User operations |
| `/api/parking` | Parking management |
| `/api/slots` | Parking slot operations |
| `/api/bookings` | Booking management |
| `/api/payments` | Payment operations |
| `/api/reviews` | Reviews and ratings |
| `/api/notifications` | Notifications |
| `/api/admin` | Admin operations |
| `/api/owner` | Owner operations |

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sumitbisen/next-park-ai.git
cd next-park-ai
```

### 2. Backend

```bash
cd backend
npm install
npm start
```

Create a `.env` file locally with the required database, JWT, Cloudinary, and payment configuration.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security Notes

- Never commit real `.env` credentials or API keys.
- Keep `JWT_SECRET` outside source control.
- Use HTTPS in production.
- Store authentication tokens using a production-appropriate secure strategy.
- Validate and authorize every protected backend operation.

## 🎯 Project Goal

Smart Parking AI aims to provide a practical digital parking ecosystem connecting drivers, parking owners, and administrators through one platform.

## 👨‍💻 Author

**Sumit Bisen**

Computer Technology Student | Full-Stack Developer | Java & DSA Learner

---

⭐ If you find this project useful, consider starring the repository.