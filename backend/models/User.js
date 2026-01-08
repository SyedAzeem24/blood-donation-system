const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'donor', 'receiver'],
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  lastDonation: {
    type: Date,
    default: null
  },
  donationCount: {
    type: Number,
    default: 0
  },
  badge: {
    type: String,
    default: 'None'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update badge based on donation count
userSchema.methods.updateBadge = function() {
  const count = this.donationCount;
  if (count >= 20) {
    this.badge = 'Platinum Donor';
  } else if (count >= 10) {
    this.badge = 'Hero Donor';
  } else if (count >= 5) {
    this.badge = 'Life Saver';
  } else if (count >= 1) {
    this.badge = 'First Donation';
  } else {
    this.badge = 'None';
  }
};

module.exports = mongoose.model('User', userSchema);
