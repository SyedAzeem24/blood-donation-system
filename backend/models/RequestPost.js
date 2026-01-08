const mongoose = require('mongoose');

const requestPostSchema = new mongoose.Schema({
  receiverId: {
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
  requestType: {
    type: String,
    required: true,
    enum: ['normal', 'emergency']
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for querying active requests
requestPostSchema.index({ status: 1, requestType: 1 });
requestPostSchema.index({ receiverId: 1 });

module.exports = mongoose.model('RequestPost', requestPostSchema);
