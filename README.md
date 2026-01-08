# Blood Donation Management System

A full-stack MERN application for managing blood donations, connecting donors with receivers, and tracking donation history.

## Features

### User Roles
- **Donor**: Can post blood donation availability, view blood requests, accept requests
- **Receiver**: Can request blood, view available donations, contact donors
- **Admin**: Can manage users and posts, view system statistics

### Core Features
- 🔐 JWT-based authentication with role-based access control
- 🩸 Blood donation post management (CRUD)
- 📋 Blood request management (CRUD)
- 📜 Donation history tracking
- 📄 PDF receipt generation for donations
- 🔔 In-app notifications
- 🌓 Dark/Light theme toggle
- 📱 Responsive design
- ♾️ Infinite scroll pagination

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18 with Vite
- React Router v6
- Axios for API calls
- jsPDF for PDF generation
- CSS Modules

## Project Structure

```
blood-donation-management-system/
├── backend/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── User.js
│   │   ├── DonationPost.js
│   │   ├── RequestPost.js
│   │   ├── DonationHistory.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donations.js
│   │   ├── requests.js
│   │   ├── users.js
│   │   ├── notifications.js
│   │   └── admin.js
│   ├── utils/
│   │   └── constants.js
│   ├── server.js
│   ├── package.json
│   └── vercel.json
├── frontend/
│   ├── public/
│   │   └── blood-drop.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useInfiniteScroll.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── donations/
│   │   │   ├── errors/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   └── requests/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── donationService.js
│   │   │   ├── requestService.js
│   │   │   ├── notificationService.js
│   │   │   ├── userService.js
│   │   │   └── adminService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── pdfGenerator.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "blood donation management system"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ADMIN_EMAIL=admin@bloodbank.com
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

Replace `your_mongodb_atlas_connection_string` with your actual MongoDB Atlas connection string.

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### Default Admin Credentials
- Email: `admin@bloodbank.com`
- Password: `admin123`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Donations
- `POST /api/donations` - Create donation post
- `GET /api/donations` - Get all available donations
- `GET /api/donations/my` - Get my donations
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `POST /api/donations/:id/fulfill` - Fulfill donation

### Requests
- `POST /api/requests` - Create blood request
- `GET /api/requests` - Get all requests
- `GET /api/requests/my` - Get my requests
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `POST /api/requests/:id/fulfill` - Fulfill request

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `GET /api/users/donation-history` - Get donation history
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/eligibility` - Check donation eligibility

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Admin
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status
- `GET /api/admin/posts` - Get all posts
- `DELETE /api/admin/posts/:type/:id` - Delete post
- `GET /api/admin/stats` - Get system statistics

## Deployment to Vercel

### Backend Deployment
1. Push backend code to GitHub
2. Import project in Vercel
3. Set root directory to `backend`
4. Add environment variables in Vercel dashboard
5. Deploy

### Frontend Deployment
1. Push frontend code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add `VITE_API_URL` pointing to deployed backend URL
5. Deploy

## Blood Types
A+, A-, B+, B-, AB+, AB-, O+, O-

## Hospitals
- City General Hospital
- St. Mary's Medical Center
- Regional Blood Bank
- University Hospital
- Community Health Center
- Central Medical Center

## License
MIT License
