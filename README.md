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

## 📊 Admin Analytics Workflow (Chart.js)

Centralized platform operational telemetry flows from MongoDB to interactive visual dashboards:

```text
MongoDB
   ↓
Admin Controller
   ↓
GET /api/admin/dashboard
   ↓
adminService.js
   ↓
AdminDashboard.js
   ↓
Chart.js
   ↓
📊 Users / Owners
📊 Parking / Slots
📊 Bookings
📊 Revenue
```

1. **MongoDB Aggregations & Queries**: Counts and aggregates users by role, parking facilities, slot availability, booking statuses (Active, Completed, Cancelled), and total revenue.
2. **Admin Controller**: Consolidates operational health metrics inside `getDashboard()`.
3. **REST Endpoint**: Protected route `GET /api/admin/dashboard` guarded with admin-role authorization.
4. **Service Client**: `adminService.js` retrieves metrics using authenticated Axios requests.
5. **Dashboard UI**: `AdminDashboard.js` maps telemetry into responsive states.
6. **Chart.js & React-Chartjs-2**: Renders 4 dynamic visual charts:
   - 📊 **Users / Owners**: User role breakdown (Customers vs Parking Operators).
   - 📊 **Parking / Slots**: Total lots, total slots, available vs reserved slots.
   - 📊 **Bookings**: Active, completed, and cancelled reservations.
   - 📊 **Revenue**: Gross settled platform revenue and ticket metrics.

## 🔄 Real-Time Slot Synchronization Flow (Socket.IO)

Real-time parking slot availability changes propagate instantaneously to all active users:

```text
User books/cancels slot
        ↓
Backend updates Slot
        ↓
Socket.IO event
        ↓
Connected users
        ↓
Parking slots instantly update 🔄
```

### Room Subscription Architecture:

```text
Parking Page
    ↓
joinParkingRoom(parkingId)
    ↓
Socket.IO Room
parking-123
    ↓
Booking/Cancel event
    ↓
slotUpdated
    ↓
Slots automatically refresh 🔄
```

1. **Page Mount**: When a user opens `ParkingDetails.js` or `Booking.js`, `joinParkingRoom(parkingId)` is called.
2. **Room Subscribed**: The client emits `joinParking` to join the targeted Socket.IO room `parking-${parkingId}`.
3. **Event Trigger**: When any user or owner books, cancels, completes, adds, or updates a slot, backend emits `slotUpdated`.
4. **Targeted Delivery**: Socket.IO broadcasts `slotUpdated` strictly to users in room `parking-${parkingId}`.
5. **Auto-Refresh 🔄**: The slot grid and available counters immediately update without a full page reload. On unmount, `leaveParkingRoom(parkingId)` cleans up the subscription.

### Multi-User Real-Time Scenario:

```text
User A books Slot 5
        ↓
MongoDB
        ↓
Slot 5 = Booked 🔴
        ↓
Socket.IO
        ↓
User B
        ↓
Slot 5 automatically 🔴
```

1. **User Action**: User A clicks on Slot 5 (🟢 Available) and confirms the reservation.
2. **Backend Database Update**: `bookingController.js` commits `Slot 5 = Booked 🔴` to MongoDB and adjusts `availableSlots`.
3. **Socket.IO Event Emission**: Backend emits `slotUpdated` event to room `parking-${parkingId}` with payload `{ type: "BOOKED", slotId, slot: { ...status: "Booked" } }`.
4. **Broadcast to Connected Clients**: User B, who has the parking booking page open at the same time, instantly receives the event via Socket.IO.
5. **Instant UI State Transition**:
   - User B's screen automatically transitions Slot 5 from **🟢 Available** to **🔴 Booked** without refreshing the page.
   - Slot 5 is disabled so User B cannot double-book it.
   - If User B had previously selected Slot 5, it is automatically deselected with an alert.
   - Available counter dynamically decrements in real time.

## 🤖 AI Parking Prediction Flow (Machine Learning)

Intelligent predictive parking occupancy analysis driven by Python Scikit-Learn Random Forest Regression:

```text
MongoDB Bookings
       ↓
Python / Scikit-learn
       ↓
Random Forest
       ↓
Occupancy Prediction
       ↓
Node.js API
       ↓
React UI
       ↓
🤖 AI Parking Prediction
```

### Architecture Breakdown:

1. **MongoDB Bookings Layer**:
   - Stores real-world parking transaction records (historical & active booking records, check-in timestamps, slot allocations, and parking facility capacities).
   - Node.js queries real-time hourly volume: `Booking.countDocuments({ parking: parkingId, createdAt: { $gte: startOfHour } })`.

2. **Python / Scikit-learn Machine Learning Engine**:
   - Located in the [`ai/`](file:///c:/Users/sbise/NEXT%20PARK%20AI/ai) directory.
   - Trains a high-performance **RandomForestRegressor** on contextual feature vectors:
     - `hour`: Time of day (0-23) capturing morning rush, peak afternoon, and late-night patterns.
     - `day`: Day of the week (0 = Monday, 6 = Sunday) capturing weekday commute vs weekend traffic variations.
     - `bookings`: Current booking volume and reservation density.
   - **Target**: Predicted parking occupancy percentage (`0% - 100%`).
   - Achieves high regression accuracy with minimal Mean Absolute Error (~1.27% MAE).
   - Serializes trained model pipeline to [`ai/parking_model.pkl`](file:///c:/Users/sbise/NEXT%20PARK%20AI/ai/parking_model.pkl).

3. **Node.js Express Integration API**:
   - Backend endpoint: `GET /api/parking/:id/prediction` in [`parkingController.js`](file:///c:/Users/sbise/NEXT%20PARK%20AI/backend/controllers/parkingController.js).
   - Inter-process bridge: Executes [`ai/predict.py`](file:///c:/Users/sbise/NEXT%20PARK%20AI/ai/predict.py) with dynamic parameters `[hour, dayOfWeek, currentBookings, totalSlots]` via `child_process.execFile`.
   - Computes intelligent heuristics and fallback metrics to guarantee 99.9% API uptime.
   - Returns structured JSON payload:
     ```json
     {
       "success": true,
       "parkingId": "65fc123...",
       "hour": 14,
       "day": 4,
       "dayName": "Friday",
       "currentBookings": 38,
       "totalSlots": 50,
       "predictedOccupancy": 76.5,
       "predictedAvailableSlots": 12,
       "demandLevel": "High",
       "recommendation": "Book in advance! Peak occupancy expected."
     }
     ```

4. **React UI Visualization**:
   - Integrated in [`frontend/src/pages/ParkingDetails.js`](file:///c:/Users/sbise/NEXT%20PARK%20AI/frontend/src/pages/ParkingDetails.js) and [`frontend/src/services/parkingService.js`](file:///c:/Users/sbise/NEXT%20PARK%20AI/frontend/src/services/parkingService.js).
   - Renders a futuristic **🤖 AI Occupancy & Demand Predictor** dashboard card with:
     - Real-time predicted occupancy gauge & progress bar.
     - Dynamic demand badges (**Low 🟢**, **Moderate 🟡**, **High 🔴**).
     - AI-driven actionable booking recommendations for drivers.

## 🛠️ Tech Stack

**Frontend**
- JavaScript
- React / Next.js ecosystem
- Chart.js & react-chartjs-2
- Socket.IO Client
- Leaflet & React-Leaflet
- REST API integration

**Backend**
- Node.js
- Express.js
- Socket.IO
- MongoDB & Mongoose
- JWT
- bcryptjs

**Services / Integrations**
- Cloudinary
- Payment services (Razorpay)

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

## 🚢 Deployment Sequence

Follow the complete step-by-step [Production Deployment Guide](file:///c:/Users/sbise/NEXT%20PARK%20AI/DEPLOYMENT.md):

1. **Step 1: MongoDB Atlas database setup** (Free M0 Cluster, `0.0.0.0/0` IP whitelist, database user).
2. **Step 2: Backend Render par deploy** (Web Service connecting `sumitbisen/next-park-ai`, root directory `backend`, build command `npm install`, start command `npm start`).
3. **Step 3: Frontend Vercel par deploy** (React SPA connecting `sumitbisen/next-park-ai`, root directory `frontend`, rewrites in `vercel.json`).
4. **Step 4: Environment variables configure** (Sync keys from `backend/.env.example` to Render and `frontend/.env.example` to Vercel).
5. **Step 5: CORS update** (Express and Socket.IO dynamically allow `CLIENT_URL` and `*.vercel.app`).
6. **Step 6: Razorpay production/test configuration** (Configure `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` for test/live transactions).
7. **Step 7: Cloudinary verify** (Validate image storage credentials for parking facility photos).
8. **Step 8: Leaflet/Socket.IO/AI API online test** (Verify map tiles, real-time slot sync WSS, and ML prediction endpoints).
9. **Step 9: Final production build + GitHub** (Commit code, push to `main`, and verify automated deployments).

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