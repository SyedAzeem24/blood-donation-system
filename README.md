# Blood Donation Management System

A full-stack web application for managing blood donations, connecting donors with receivers.

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, jsPDF, CSS Modules

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

## Features

- User authentication (Donor, Receiver, Admin roles)
- Blood donation post management
- Blood request management
- Donation history with PDF receipts
- In-app notifications
- Dark/Light theme
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account or local MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SyedAzeem24/blood-donation-system.git
   cd blood-donation-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the backend folder:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Run the application**
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open** `http://localhost:5173` in your browser
