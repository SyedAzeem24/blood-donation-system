const express = require('express');
const DonationPost = require('../models/DonationPost');
const DonationHistory = require('../models/DonationHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { BLOOD_TYPES, HOSPITALS, POST_EXPIRY_DAYS, DONATION_COOLOFF_DAYS } = require('../utils/constants');

const router = express.Router();

// Helper function to move expired donations to history
const moveExpiredToHistory = async () => {
  try {
    const now = new Date();
    const expiredDonations = await DonationPost.find({
      status: 'available',
      expiryDate: { $lt: now }
    });

    for (const donation of expiredDonations) {
      // Create history entry
      await DonationHistory.create({
        donorId: donation.donorId,
        bloodType: donation.bloodType,
        hospital: donation.hospital,
        donationDate: donation.donationDate,
        quantity: donation.quantity,
        status: 'expired',
        originalPostId: donation._id
      });

      // Update donation status
      donation.status = 'expired';
      await donation.save();
    }
  } catch (error) {
    console.error('Error moving expired donations:', error);
  }
};

// @route   POST /api/donations
// @desc    Create a new donation post
// @access  Private (Donor only)
router.post('/', auth, roleCheck('donor'), async (req, res) => {
  try {
    const { bloodType, hospital, donationDate, quantity } = req.body;

    // Validation
    if (!bloodType || !hospital || !donationDate || !quantity) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ message: 'Invalid blood type' });
    }

    if (!HOSPITALS.includes(hospital)) {
      return res.status(400).json({ message: 'Invalid hospital' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1 unit' });
    }

    // Check eligibility (90-day cooloff)
    const user = await User.findById(req.userId);
    if (user.lastDonation) {
      const cooloffEnd = new Date(user.lastDonation);
      cooloffEnd.setDate(cooloffEnd.getDate() + DONATION_COOLOFF_DAYS);
      
      if (new Date() < cooloffEnd) {
        return res.status(400).json({ 
          message: `You are not eligible to donate yet. Next eligible date: ${cooloffEnd.toDateString()}`,
          nextEligibleDate: cooloffEnd
        });
      }
    }

    // Calculate expiry date (7 days from donation date)
    const donationDateObj = new Date(donationDate);
    const expiryDate = new Date(donationDateObj);
    expiryDate.setDate(expiryDate.getDate() + POST_EXPIRY_DAYS);

    // Create donation post
    const donation = new DonationPost({
      donorId: req.userId,
      bloodType,
      hospital,
      donationDate: donationDateObj,
      expiryDate,
      quantity
    });

    await donation.save();

    // Update user's last donation and donation count
    user.lastDonation = donationDateObj;
    user.donationCount += 1;
    user.updateBadge();
    await user.save();

    // Create notifications for all receivers
    const receivers = await User.find({ role: 'receiver' });
    const notifications = receivers.map(receiver => ({
      userId: receiver._id,
      type: 'new_donation',
      message: `New ${bloodType} blood donation available at ${hospital}`,
      postId: donation._id,
      postType: 'donation'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Populate donor info for response
    await donation.populate('donorId', 'fullName email');

    res.status(201).json({
      message: 'Donation posted successfully',
      donation,
      userBadge: user.badge,
      donationCount: user.donationCount
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error creating donation' });
  }
});

// @route   GET /api/donations
// @desc    Get all active donations (with pagination)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Move expired donations to history first
    await moveExpiredToHistory();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const bloodType = req.query.bloodType;

    // Build query
    const query = { status: 'available' };
    if (bloodType && BLOOD_TYPES.includes(bloodType)) {
      query.bloodType = bloodType;
    }

    const donations = await DonationPost.find(query)
      .populate('donorId', 'fullName email phone badge')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DonationPost.countDocuments(query);

    res.json({
      donations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDonations: total,
      hasMore: skip + donations.length < total
    });
  } catch (error) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
});

// @route   GET /api/donations/my-donations
// @desc    Get current user's donations
// @access  Private (Donor only)
router.get('/my-donations', auth, roleCheck('donor'), async (req, res) => {
  try {
    const donations = await DonationPost.find({ donorId: req.userId })
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error('Fetch my donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/history
// @desc    Get donation history
// @access  Private (Donor only)
router.get('/history', auth, roleCheck('donor'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const history = await DonationHistory.find({ donorId: req.userId })
      .sort({ donationDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DonationHistory.countDocuments({ donorId: req.userId });

    res.json({
      history,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasMore: skip + history.length < total
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await DonationPost.findById(req.params.id)
      .populate('donorId', 'fullName email phone badge');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    console.error('Fetch donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete donation post
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await DonationPost.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user is owner or admin
    if (donation.donorId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    await DonationPost.findByIdAndDelete(req.params.id);

    // Also delete related notifications
    await Notification.deleteMany({ postId: req.params.id });

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/fulfill
// @desc    Mark a donation as fulfilled/completed
// @access  Private (Receiver only)
router.post('/:id/fulfill', auth, roleCheck('receiver'), async (req, res) => {
  try {
    // Use findOneAndUpdate to atomically check and update status
    const donation = await DonationPost.findOneAndUpdate(
      { _id: req.params.id, status: 'available' },
      { status: 'fulfilled' },
      { new: false } // Return the original document before update
    ).populate('donorId', 'fullName email');

    if (!donation) {
      // Either not found or already fulfilled
      const exists = await DonationPost.findById(req.params.id);
      if (!exists) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      return res.status(400).json({ message: 'This donation has already been accepted' });
    }

    // Create history entry for the donor
    await DonationHistory.create({
      donorId: donation.donorId._id,
      receiverId: req.userId,
      bloodType: donation.bloodType,
      hospital: donation.hospital,
      donationDate: donation.donationDate,
      quantity: donation.quantity,
      status: 'completed',
      originalPostId: donation._id
    });

    // Notify the donor
    await Notification.create({
      userId: donation.donorId._id,
      type: 'donation_fulfilled',
      message: `Your ${donation.bloodType} blood donation has been accepted by a receiver!`,
      postId: donation._id,
      postType: 'donation'
    });

    res.json({ message: 'Donation marked as fulfilled. Thank you!' });
  } catch (error) {
    console.error('Fulfill donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/receipt/:id
// @desc    Get receipt data for a donation
// @access  Private (Donor only - owner)
router.get('/receipt/:id', auth, async (req, res) => {
  try {
    const donation = await DonationPost.findById(req.params.id)
      .populate('donorId', 'fullName email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user is the donor
    if (donation.donorId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this receipt' });
    }

    // Return receipt data (PDF will be generated on frontend)
    res.json({
      receiptId: `BDR-${donation._id.toString().slice(-8).toUpperCase()}`,
      donorName: donation.donorId.fullName,
      donorEmail: donation.donorId.email,
      bloodType: donation.bloodType,
      hospital: donation.hospital,
      donationDate: donation.donationDate,
      quantity: donation.quantity,
      createdAt: donation.createdAt
    });
  } catch (error) {
    console.error('Fetch receipt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
