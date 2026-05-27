# She Can Foundation Full-Stack Website

A premium, interactive, and responsive full-stack web application built with Node.js, Express, MongoDB Atlas, and Vanilla frontend technologies (HTML5, CSS3, ES6 JS). 

The portal has been migrated from a static site to a production-ready, serverless-compatible backend structure optimized for deployment on Vercel.

---

## 🚀 Key Features

### 1. Full-Stack Backend Integration
- **Node.js & Express**: API routing, middleware execution, and static asset serving.
- **Serverless Ready**: Built with an `/api` folder structure and `vercel.json` routing configuration to run flawlessly on Vercel Serverless Functions.
- **MongoDB Atlas Connection**: Integrates with a MongoDB cloud database for persistent volunteer registrations.
- **Stateless JWT Cookie Authentication**: Implements JSON Web Tokens (JWT) stored inside secure, server-side `HttpOnly` cookies. This prevents random logouts on stateless serverless servers.

### 2. Bulletproof Graceful Fallback
- **Offline / Zero-Config Mode**: If the database connection fails or the machine is offline, the backend gracefully logs a warning and automatically falls back to an **in-memory database mockup**.
- **100% Uptime**: The website, form submissions, and the Admin Panel function perfectly out-of-the-box without requiring any local MongoDB installations or configurations.

### 3. Interactive Admin Dashboard (`/admin`)
- **Login screen**: Styled with premium glassmorphism, centering a secure credentials card over drifting background blobs.
- **Total stats block**: Calculates live count cards (Total Registrations, and interest distribution across Livelihood, Advocacy, Outreach, etc.).
- **Live Search & Filter**: Real-time client-side search box that filters volunteer listings by name, email, or cover letter, and a dropdown selector to filter by role/interest.
- **Detail View Modal**: Click any application row to pop open a detailed glass card displaying the full message with line breaks.
- **Delete Submissions**: Triggers secure, authenticated `DELETE` API requests to delete volunteer records instantly.

### 4. Smart Volunteer Form Validation (`/join`)
- **Interactive POST Validation**: Form on `/join` submits details via `fetch` to `POST /api/join`, runs server-side validation, and triggers the success draw-in SVG checkmark modal.

---

## 📂 Project Architecture

```directory
jolly-euclid/
├── vercel.json           # Vercel serverless function routing rules
├── server.js             # Local backend entry point (listens on Port 3000)
├── package.json          # Node dependencies & launch scripts
├── .env                  # Configuration variables (keys, DB URI, admin settings)
├── index.html            # Static frontend pages
├── about.html
├── initiatives.html
├── donate.html
├── join.html
├── admin.html            # Admin dashboard and login interface
├── api/
│   ├── index.js          # Main Express app definition & serverless endpoints
│   ├── config/
│   │   └── db.js         # MongoDB connection config with error fallbacks
│   └── models/
│       └── Submission.js # Mongoose schema with database validators
├── css/
│   ├── style.css         # Styling system variables & cinematic particles
│   ├── components.css    # Responsive components, tables, and dialogs
│   └── animations.css    # Transitions, floats, and glow keyframes
└── js/
    ├── main.js           # Header, navigation, and theme actions
    ├── validation.js     # Real-time form checks and API POST triggers
    └── admin.js          # Admin dashboard rendering, search, and delete triggers
```

---

## 🛠️ Tech Stack & Dependencies

- **Backend**: Express, JWT, cookie-parser, dotenv, mongoose.
- **Frontend**: Vanilla HTML5, Custom CSS3, ES6 JavaScript, Google Font Symbols, and Google Font families (*Inter*, *Plus Jakarta Sans*).

---

## 💻 How to View & Run Locally

### 1. Setup
1. Clone or download this project folder to your local machine:
   ```bash
   C:\Users\91628\Documents\antigravity\jolly-euclid
   ```
2. Open your terminal in the folder and run `npm install` to download dependencies:
   ```bash
   npm install
   ```

### 2. Launch Local Server
Start the Node server:
```bash
npm start
```
The console will boot up and log:
```
=================================================
  She Can Foundation Backend Server Running!
  Local URL: http://localhost:3000
  Admin Dashboard: http://localhost:3000/admin
=================================================
```

### 3. Admin Credentials
Open `http://localhost:3000/admin` in your browser and log in using:
- **Default Username**: `admin`
- **Default Password**: `shecanadmin123`

---

## ☁️ Environment Configuration (.env)

A `.env` file is generated in the root directory. To connect your own MongoDB database:
1. Setup a free cluster on MongoDB Atlas.
2. Edit the `.env` file in the root folder:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0...mongodb.net/<db>?retryWrites=true&w=majority
   JWT_SECRET=any_custom_secret_key_string
   ADMIN_USER=admin
   ADMIN_PASS=shecanadmin123
   ```
3. Restart the server. It will log: `Database connected: cluster0...`
