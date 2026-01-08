const express = require('express');
const User = require('../models/User');
const DonationPost = require('../models/DonationPost');
const RequestPost = require('../models/RequestPost');
const DonationHistory = require('../models/DonationHistory');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/stats', auth, roleCheck('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalReceivers,
      activeDonations,
      activeRequests,
      totalDonationsCompleted,
      emergencyRequests
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'receiver' }),
      DonationPost.countDocuments({ status: 'available' }),
      RequestPost.countDocuments({ status: 'active' }),
      DonationHistory.countDocuments(),
      RequestPost.countDocuments({ status: 'active', requestType: 'emergency' })
    ]);

    // Blood type distribution
    const bloodTypeStats = await DonationPost.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      totalDonors,
      totalReceivers,
      activeDonations,
      activeRequests,
      totalDonationsCompleted,
      emergencyRequests,
      bloodTypeStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', auth, roleCheck('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    const query = { role: { $ne: 'admin' } };
    if (role && ['donor', 'receiver'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasMore: skip + users.length < total
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/all-posts
// @desc    Get all posts (donations and requests)
// @access  Private (Admin only)
router.get('/all-posts', auth, roleCheck('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type; // 'donation' or 'request'

    let donations = [];
    let requests = [];
    let totalDonations = 0;
    let totalRequests = 0;

    if (!type || type === 'donation') {
      donations = await DonationPost.find()
        .populate('donorId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(type === 'donation' ? skip : 0)
        .limit(type === 'donation' ? limit : 5);
      totalDonations = await DonationPost.countDocuments();
    }

    if (!type || type === 'request') {
      requests = await RequestPost.find()
        .populate('receiverId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(type === 'request' ? skip : 0)
        .limit(type === 'request' ? limit : 5);
      totalRequests = await RequestPost.countDocuments();
    }

    res.json({
      donations,
      requests,
      totalDonations,
      totalRequests,
      currentPage: page
    });
  } catch (error) {
    console.error('Fetch all posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/post/:type/:id
// @desc    Delete any post
// @access  Private (Admin only)
router.delete('/post/:type/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'donation') {
      const donation = await DonationPost.findByIdAndDelete(id);
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
    } else if (type === 'request') {
      const request = await RequestPost.findByIdAndDelete(id);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid post type' });
    }

    // Delete related notifications
    await Notification.deleteMany({ postId: id });

    res.json({ message: `${type} deleted successfully` });
  } catch (error) {
    console.error('Admin delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/user/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/user/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete user's posts
    if (user.role === 'donor') {
      await DonationPost.deleteMany({ donorId: user._id });
      await DonationHistory.deleteMany({ donorId: user._id });
    } else if (user.role === 'receiver') {
      await RequestPost.deleteMany({ receiverId: user._id });
    }

    // Delete user's notifications
    await Notification.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/post/:type/:id
// @desc    Edit any post
// @access  Private (Admin only)
router.put('/post/:type/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { type, id } = req.params;
    const updates = req.body;

    if (type === 'donation') {
      const donation = await DonationPost.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).populate('donorId', 'fullName email');
      
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      res.json({ message: 'Donation updated', post: donation });
    } else if (type === 'request') {
      const request = await RequestPost.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).populate('receiverId', 'fullName email');
      
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      res.json({ message: 'Request updated', post: request });
    } else {
      return res.status(400).json({ message: 'Invalid post type' });
    }
  } catch (error) {
    console.error('Admin edit post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
