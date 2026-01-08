const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// Import User model for seeding admin
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all vercel.app domains and localhost
    const allowedOrigins = [
      /\.vercel\.app$/,
      /localhost:\d+$/,
      /127\.0\.0\.1:\d+$/
    ];
    
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB');
    
    // Seed admin on first connection
    await seedAdmin();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// Seed admin user function
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@bloodbank.com',
        password: 'admin123',
        fullName: 'System Administrator',
        role: 'admin',
        bloodType: 'O+',
        phone: '+92-300-0000000'
      });
      await admin.save();
      console.log('✅ Admin user created successfully');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

// Database connection middleware (runs before each request)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Blood Donation Management System API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}

// Export for Vercel
module.exports = app;
