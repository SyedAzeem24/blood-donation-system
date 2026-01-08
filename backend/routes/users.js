const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { BLOOD_TYPES, DONATION_COOLOFF_DAYS } = require('../utils/constants');

const router = express.Router();

// @route   GET /api/users/eligibility
// @desc    Check donor eligibility for donation
// @access  Private (Donor only)
router.get('/eligibility', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can check eligibility' });
    }

    const user = await User.findById(req.userId);
    
    if (!user.lastDonation) {
      return res.json({
        eligible: true,
        message: 'You are eligible to donate blood!',
        lastDonation: null,
        nextEligibleDate: null
      });
    }

    const lastDonationDate = new Date(user.lastDonation);
    const nextEligibleDate = new Date(lastDonationDate);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + DONATION_COOLOFF_DAYS);

    const now = new Date();
    const eligible = now >= nextEligibleDate;
    const daysRemaining = eligible ? 0 : Math.ceil((nextEligibleDate - now) / (1000 * 60 * 60 * 24));

    res.json({
      eligible,
      message: eligible 
        ? 'You are eligible to donate blood!' 
        : `You need to wait ${daysRemaining} more days before your next donation.`,
      lastDonation: user.lastDonation,
      nextEligibleDate: eligible ? null : nextEligibleDate,
      daysRemaining
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, phone, bloodType } = req.body;
    const updateFields = {};

    if (fullName) updateFields.fullName = fullName;
    if (phone !== undefined) updateFields.phone = phone;
    if (bloodType && BLOOD_TYPES.includes(bloodType)) {
      updateFields.bloodType = bloodType;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    res.json({
      donationCount: user.donationCount,
      badge: user.badge,
      lastDonation: user.lastDonation,
      memberSince: user.createdAt
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
