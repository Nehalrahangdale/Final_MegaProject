# 🅿️ Next Park AI

A smart parking slot management web application that helps users find, view and book parking slots easily, while giving admins a simple way to manage parking availability.

🔗 **Live Demo:** [https://next-park.onrender.com](https://next-park.onrender.com)

> ⏳ The app is hosted on Render's free tier, so the first load may take 30–60 seconds while the server wakes up.

---

## 📌 Features

- 🔐 User authentication (sign up / login)
- 🚗 View available parking slots in real time
- 📅 Book and manage parking slots
- 🛠️ Admin controls to add, update and manage slots
- 📱 Responsive design for desktop and mobile
- ☁️ Cloud database using MongoDB Atlas

---

## 🛠️ Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | React.js, HTML, CSS, JavaScript      |
| Backend    | Node.js, Express.js                  |
| Database   | MongoDB Atlas, Mongoose              |
| Deployment | Render                               |
| Tools      | Git, GitHub, Postman, VS Code        |

---

## 📂 Project Structure

```
next-park-ai/
├── backend/        # Express server, routes, controllers, models
│   ├── .env        # Environment variables (not committed)
│   └── ...
├── frontend/       # React application
│   └── ...
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started (Run Locally)

### 1. Clone the repository

```bash
git clone https://github.com/Nehalrahangdale/final_megaproject.git
cd final_megaproject
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

Start the server:

```bash
npm start
```

### 3. Setup the frontend

```bash
cd frontend
npm install
npm start
```

The app will run at `http://localhost:3000` (frontend) and `http://localhost:5000` (backend).

---

## 🚀 Deployment

The project is deployed on **Render** with **MongoDB Atlas** as the database.
Environment variables are configured in the Render dashboard.

---

## 👥 Team

| Name              | Role                                 |
| ----------------- | ------------------------------------ |
| Sumit Bisen       | Developer                            |
| Nehal Rahangdale  | Developer, Deployment & Documentation |

Original repository: [sumitbisen/next-park-ai](https://github.com/sumitbisen/next-park-ai)

---

## 📬 Contact

**Nehal Rahangdale**
📧 nehalrahangdale55@gmail.com
🔗 [GitHub](https://github.com/Nehalrahangdale) · [LinkedIn](https://linkedin.com/in/nehal-rahangdale)

---

⭐ If you like this project, give it a star!
