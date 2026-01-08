const mongoose = require('mongoose');

const donationPostSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  hospital: {
    type: String,
    required: true
  },
  donationDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'expired', 'completed'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Index for querying active donations
donationPostSchema.index({ status: 1, expiryDate: 1 });
donationPostSchema.index({ donorId: 1 });

module.exports = mongoose.model('DonationPost', donationPostSchema);
