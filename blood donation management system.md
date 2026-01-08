\# GitHub Copilot Prompt: Blood Donation Management System

\## PROJECT TITLE

Blood Donation Management System - MERN Stack Application

\## PROJECT OVERVIEW

Build a complete Blood Donation Management System using MERN stack. The system connects blood donors with recipients through a centralized platform where donors can post available blood donations and receivers can post blood requests. Both parties get notifications about new posts.

\## TECH STACK SPECIFICATIONS

\- Frontend: React.js with React Router DOM v6

\- Build Tool: Vite (npm create vite@latest)

\- State Management: React Hooks (useState, useEffect, useContext)

\- HTTP Client: Axios for API calls

\- Backend: Node.js with Express.js

\- Database: MongoDB with Mongoose ODM

\- Authentication: JWT (JSON Web Tokens)

\- PDF Generation: jsPDF library

\- Styling: Plain CSS with CSS Modules

\- Icons: React Icons library

\- Date Handling: date-fns library

\- Package Manager: npm for all installations

\## USER ROLES

1\. ADMIN: View all data, edit/delete any posts, view statistics

2\. DONOR: Post blood donations, view donation history, download receipts, see blood requests, get notifications

3\. RECEIVER: Post blood requests, view available blood donations, get notifications

\## CORE FEATURES

\### AUTHENTICATION SYSTEM

\- Separate registration/login for Admin/Donor/Receiver

\- JWT token-based authentication

\- Role-based protected routes

\- Login persists until logout

\### BLOOD DONATION POSTING (DONORS)

\- Donors create posts with:

\- Blood type (dropdown: A+, A-, B+, B-, AB+, AB-, O+, O-)

\- Hospital name (from predefined dropdown list)

\- Donation date (HTML5 date input)

\- Quantity in units (number input)

\- Posts automatically expire after 7 days

\- After posting, "Download Receipt" button appears

\- Expired posts move to history automatically

\### BLOOD REQUEST POSTING (RECEIVERS)

\- Receivers create request posts with:

\- Needed blood type (dropdown)

\- Hospital preference (from same dropdown)

\- Request type: Normal or Emergency

\- Additional notes (optional text)

\- Emergency requests appear at top of lists

\- All requests are automatically posted

\### DUAL POSTING SYSTEM

\- Two main sections:

1\. Blood Donations - Posts by donors

2\. Blood Requests - Posts by receivers

\- Both donors and receivers can see BOTH types of posts

\- Separate pages for viewing each type

\### NOTIFICATION SYSTEM

\- Bell icon in navbar

\- Notifications stored in database

\- Triggers:

\- Donor posts new blood donation → All receivers get notification

\- Receiver posts new blood request → All donors get notification

\- Notifications show when user logs in or manually refreshes

\- Read/unread status with badge count

\- Click notification to view the related post

\### BLOOD COMPATIBILITY DISPLAY

\- Show compatibility table on dashboard:

\- O- can donate to ALL (Universal Donor)

\- AB+ can receive from ALL (Universal Recipient)

\- Simple table display

\### DONOR ELIGIBILITY CHECK

\- 90-day (3-month) cool-off period between donations

\- Simple check: If last donation date + 90 days > today, show "Not Eligible"

\- Show "Next Eligible Date" calculation

\### DONATION HISTORY & BADGES

\- Separate history collection for expired donations

\- Badge system (display only):

\- First Donation (1+ donations)

\- Life Saver (5+ donations)

\- Hero Donor (10+ donations)

\- Platinum Donor (20+ donations)

\- Badges shown on donor profile

\### PDF RECEIPT GENERATION

\- Donors can download receipt after posting donation

\- PDF contains:

\- Donor name

\- Donation date

\- Blood type

\- Hospital name

\- Unique receipt ID

\- Generated using jsPDF, downloaded directly

\### DARK/LIGHT MODE TOGGLE

\- Theme toggle in navbar

\- Persists in localStorage

\- Light mode: Professional red/white theme

\- Dark mode: Dark red/dark gray theme

\- Smooth CSS transitions

\### ADMIN DASHBOARD

\- View all users

\- View all active donations and requests

\- Edit/delete any post

\- View basic statistics

\## DATABASE SCHEMA

\### User Collection

{

\_id: ObjectId,

role: \['admin', 'donor', 'receiver'\],

email: {type: String, unique: true, required: true},

password: {type: String, required: true},

fullName: {type: String, required: true},

bloodType: String,

phone: String,

createdAt: {type: Date, default: Date.now},

lastDonation: Date,

donationCount: {type: Number, default: 0},

badge: {type: String, default: 'None'}

}

\### DonationPost Collection

{

\_id: ObjectId,

donorId: {type: ObjectId, ref: 'User', required: true},

bloodType: {type: String, required: true},

hospital: {type: String, required: true},

donationDate: {type: Date, required: true},

expiryDate: {type: Date, required: true},

quantity: {type: Number, required: true, min: 1},

status: {type: String, default: 'available'},

createdAt: {type: Date, default: Date.now}

}

\### RequestPost Collection

{

\_id: ObjectId,

receiverId: {type: ObjectId, ref: 'User', required: true},

bloodType: {type: String, required: true},

hospital: {type: String, required: true},

requestType: {type: String, required: true, enum: \['normal', 'emergency'\]},

notes: String,

status: {type: String, default: 'active'},

createdAt: {type: Date, default: Date.now}

}

\### DonationHistory Collection

{

\_id: ObjectId,

donorId: {type: ObjectId, ref: 'User', required: true},

bloodType: {type: String, required: true},

hospital: {type: String, required: true},

donationDate: {type: Date, required: true},

quantity: {type: Number, required: true},

status: {type: String},

createdAt: {type: Date, default: Date.now}

}

\### Notification Collection

{

\_id: ObjectId,

userId: {type: ObjectId, ref: 'User', required: true},

type: {type: String, enum: \['new\_donation', 'new\_request'\]},

message: {type: String, required: true},

postId: {type: ObjectId, required: true},

postType: {type: String, enum: \['donation', 'request'\]},

isRead: {type: Boolean, default: false},

createdAt: {type: Date, default: Date.now}

}

\## API ENDPOINTS

\### Authentication (/api/auth)

\- POST /register - Register new user

\- POST /login - Login user, return JWT

\- GET /profile - Get current user profile

\- POST /logout - Logout

\### Donations (/api/donations)

\- POST / - Create new donation post

\- GET / - Get all active donations (infinite scroll)

\- GET /history - Get donation history

\- DELETE /:id - Delete donation post

\- GET /receipt/:id - Download PDF receipt

\### Requests (/api/requests)

\- POST / - Create new blood request

\- GET / - Get all active requests (infinite scroll)

\- DELETE /:id - Delete request post

\### Users (/api/users)

\- GET /eligibility - Check donor eligibility

\- PUT /profile - Update user profile

\### Notifications (/api/notifications)

\- GET / - Get user notifications

\- PUT /:id/read - Mark as read

\- PUT /read-all - Mark all as read

\- GET /unread-count - Get unread count

\### Admin (/api/admin)

\- GET /stats - Get statistics

\- GET /all-posts - Get all posts

\- DELETE /post/:type/:id - Delete any post

\## FRONTEND FOLDER STRUCTURE

blood-donation-system/

├── backend/

│ ├── server.js

│ ├── package.json

│ ├── .env

│ ├── models/

│ │ ├── User.js

│ │ ├── DonationPost.js

│ │ ├── RequestPost.js

│ │ ├── DonationHistory.js

│ │ └── Notification.js

│ ├── routes/

│ │ ├── auth.js

│ │ ├── donations.js

│ │ ├── requests.js

│ │ ├── users.js

│ │ ├── notifications.js

│ │ └── admin.js

│ ├── middleware/

│ │ ├── auth.js

│ │ └── roleCheck.js

│ └── utils/

│ ├── generateReceipt.js

│ └── constants.js

│

└── frontend/

├── public/

├── src/

│ ├── main.jsx

│ ├── App.jsx

│ ├── index.css

│ ├── App.css

│ ├── components/

│ │ ├── layout/

│ │ │ ├── Navbar.jsx

│ │ │ ├── Sidebar.jsx

│ │ │ └── NotificationBell.jsx

│ │ ├── auth/

│ │ │ ├── Login.jsx

│ │ │ └── Register.jsx

│ │ ├── dashboard/

│ │ │ ├── AdminDashboard.jsx

│ │ │ ├── DonorDashboard.jsx

│ │ │ └── ReceiverDashboard.jsx

│ │ ├── posts/

│ │ │ ├── DonationForm.jsx

│ │ │ ├── RequestForm.jsx

│ │ │ ├── DonationList.jsx

│ │ │ ├── RequestList.jsx

│ │ │ └── PostCard.jsx

│ │ ├── features/

│ │ │ ├── BloodCompatibility.jsx

│ │ │ ├── EligibilityCheck.jsx

│ │ │ ├── BadgeDisplay.jsx

│ │ │ └── ThemeToggle.jsx

│ │ └── common/

│ │ ├── Button.jsx

│ │ ├── Input.jsx

│ │ ├── Card.jsx

│ │ ├── Toast.jsx

│ │ └── Loader.jsx

│ ├── pages/

│ │ ├── HomePage.jsx

│ │ ├── DonationsPage.jsx

│ │ ├── RequestsPage.jsx

│ │ ├── HistoryPage.jsx

│ │ └── NotificationsPage.jsx

│ ├── context/

│ │ ├── AuthContext.jsx

│ │ └── ThemeContext.jsx

│ ├── services/

│ │ ├── api.js

│ │ ├── authService.js

│ │ ├── donationService.js

│ │ ├── requestService.js

│ │ └── notificationService.js

│ ├── utils/

│ │ ├── formatters.js

│ │ ├── validators.js

│ │ └── constants.js

│ └── hooks/

│ ├── useAuth.js

│ └── useInfiniteScroll.js

└── package.json

\## PREDEFINED CONSTANTS

\### Hospital List

export const HOSPITALS = \[

"Shifa International Hospital, Islamabad",

"Pakistan Institute of Medical Sciences (PIMS), Islamabad",

"Aga Khan University Hospital, Karachi",

"Jinnah Hospital, Lahore",

"Lahore General Hospital, Lahore",

"Combined Military Hospital (CMH), Rawalpindi",

"Holy Family Hospital, Rawalpindi",

"Services Hospital, Lahore",

"Mayo Hospital, Lahore",

"Civil Hospital, Karachi"

\];

\### Blood Types

export const BLOOD\_TYPES = \['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'\];

\### Badge Requirements

export const BADGES = {

'First Donation': 1,

'Life Saver': 5,

'Hero Donor': 10,

'Platinum Donor': 20

};

\## SETUP INSTRUCTIONS

\### Backend Setup

1\. Create backend folder

2\. Run npm init -y

3\. Install: npm install express mongoose cors dotenv jsonwebtoken jspdf

4\. Create server.js with Express setup

5\. Create .env with:

PORT=5000

MONGODB\_URI=mongodb://localhost:27017/blood-donation

JWT\_SECRET=your\_jwt\_secret\_key

6\. Create folder structure

7\. Start with models/User.js then authentication

\### Frontend Setup

1\. Create frontend folder

2\. Run: npm create vite@latest . -- --template react

3\. Install: npm install axios react-router-dom react-icons date-fns

4\. Clean up default files

5\. Create folder structure

6\. Start with context/AuthContext.jsx

7\. Create basic layout components

\## IMPLEMENTATION ORDER

1\. Backend Foundation

\- Express server

\- MongoDB connection

\- User model and auth routes

\- JWT middleware

2\. Frontend Foundation

\- Vite React setup

\- Routing structure

\- Auth context

\- Basic layout

3\. Core Features

\- Donation posting

\- Request posting

\- Post listing with infinite scroll

\- Notification system backend

4\. User Experience

\- Notification bell

\- Dark/light mode

\- PDF receipts

\- Eligibility check

5\. Admin Features

\- Admin dashboard

\- Statistics

\- Post management

6\. Polish

\- Blood compatibility

\- Badge system

\- Responsive design

\- Manual form validation

\## SPECIFIC REQUIREMENTS

\### Infinite Scroll Implementation

\- Use Intersection Observer API

\- Load 10 items at a time

\- Show loading indicator at bottom

\- Reset on filter change

\### Toast Notification Component

\- Custom Toast component

\- Positions: top-right

\- Types: success, error, info

\- Auto-dismiss after 5 seconds

\### Manual Form Validation

\- Required field validation

\- Email format validation

\- Password length validation

\- Date range validation

\- Display error messages below fields

\### Context Usage

\- AuthContext for user authentication state

\- ThemeContext for dark/light mode

\- Both use useContext and useState

\### CSS Guidelines

\- CSS Modules for component styling

\- Global CSS for theme variables

\- Red/white professional theme

\- Mobile responsive design

\- Dark mode variables

\## COLOR SCHEME

\### Light Mode

\- Primary Red: #dc2626

\- Light Red: #fecaca

\- White: #ffffff

\- Text: #374151

\- Background: #f9fafb

\### Dark Mode

\- Dark Red: #991b1b

\- Dark Gray: #1f2937

\- Text: #f9fafb

\- Background: #111827