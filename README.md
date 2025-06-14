# 🍽️ FoodShare (RefedConnect)

> **Sharing food, connecting hearts.**  
> Built with ❤️ by Chanchal & Jay.

---

## 📌 Overview

**FoodShare (RefedConnect)** is a platform that bridges the gap between **food donors**, **NGOs**, and **biogas agents**. It aims to reduce food waste and utilize organic waste efficiently by:

- Donating leftover or fresh food to NGOs.
- Routing organic waste to biogas agents for energy production.

---

## 🚀 Live Demo

🌐 Frontend: [https://foodshare-umber.vercel.app](https://foodshare-umber.vercel.app)  
⚙️ Backend API: [https://foodshare-app.onrender.com](https://foodshare-app.onrender.com)

---

## 👥 Roles & Functionality

| Role           | Features |
|----------------|----------|
| **Donor**      | Submit food or organic waste for donation. See real-time status. |
| **NGO Agent**  | View available food donations, accept & mark as collected. |
| **Biogas Agent** | View organic waste submissions and collect for processing. |

Each role has a **dedicated dashboard** and **token-based access control**.

---

## 🔐 Login Credentials (Hardcoded)

| Role         | Email               | Password   |
|--------------|---------------------|------------|
| Donor        | donor@example.com   | donor123   |
| NGO Agent    | ngo@example.com     | ngo123     |
| Biogas Agent | biogas@example.com  | biogas123  |

---

## 🛠️ Tech Stack

- **Frontend:** HTML, Tailwind CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Render)
- **Hosting:**
  - Frontend → [Vercel](https://vercel.com)
  - Backend → [Render](https://render.com)
- **Authentication:** JSON Web Tokens (JWT)
- **Version Control:** Git & GitHub

---

## 📂 Project Structure


FoodShare/
│
├── foodshare-frontend/     # Frontend UI files (HTML, JS, CSS)
├── routes/                 # Express route files
│   └── donation.routes.js
│   └── authRoutes.js
├── models/                 # Mongoose schemas (Donation)
├── middleware/             # JWT auth middleware
├── app.js                  # Main server file
├── .env                    # Environment variables (MONGO_URI, JWT_SECRET)
├── package.json            # Project metadata
└── README.md               # Project documentation



---

## ✅ Features

- 🌐 Clean, responsive UI with Tailwind CSS
- 🔐 Role-based login system
- 📥 Donation form with food/waste types
- ⏱️ Real-time update on donation status
- 🔔 Notifications to NGOs & Biogas Agents
- 🧾 Clean dashboards for all roles

---

## 🧪 API Endpoints (Backend)

| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| POST   | `/api/auth/login`     | Login for all users           |
| POST   | `/api/donations/submit` | Submit food or waste donation |
| GET    | `/api/donations/pending` | Get uncollected donations    |
| POST   | `/api/donations/mark-collected` | Mark as collected         |

---

## 🛠️ Local Setup

### Prerequisites:
- Node.js & npm
- MongoDB connection string (or use Render)

### Clone & Run

```bash
# Clone repo
git clone https://github.com/cse22148/Foodshare.git
cd Foodshare

# Install dependencies
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "JWT_SECRET=yourSecretKey" >> .env

# Run backend
node app.js




📣 Future Enhancements
✅ Real user registration

📍 Location-based NGO assignment

📊 Dashboard analytics (meals saved, waste reused)

✉️ Email/SMS alerts to agents