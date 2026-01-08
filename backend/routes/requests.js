const express = require('express');
const RequestPost = require('../models/RequestPost');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { BLOOD_TYPES, HOSPITALS } = require('../utils/constants');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new blood request
// @access  Private (Receiver only)
router.post('/', auth, roleCheck('receiver'), async (req, res) => {
  try {
    const { bloodType, hospital, requestType, notes } = req.body;

    // Validation
    if (!bloodType || !hospital || !requestType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ message: 'Invalid blood type' });
    }

    if (!HOSPITALS.includes(hospital)) {
      return res.status(400).json({ message: 'Invalid hospital' });
    }

    if (!['normal', 'emergency'].includes(requestType)) {
      return res.status(400).json({ message: 'Request type must be normal or emergency' });
    }

    // Create request post
    const request = new RequestPost({
      receiverId: req.userId,
      bloodType,
      hospital,
      requestType,
      notes: notes || ''
    });

    await request.save();

    // Create notifications for all donors
    const donors = await User.find({ role: 'donor' });
    const urgencyLabel = requestType === 'emergency' ? '🚨 EMERGENCY: ' : '';
    const notifications = donors.map(donor => ({
      userId: donor._id,
      type: 'new_request',
      message: `${urgencyLabel}New ${bloodType} blood request at ${hospital}`,
      postId: request._id,
      postType: 'request'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Populate receiver info for response
    await request.populate('receiverId', 'fullName email');

    res.status(201).json({
      message: 'Blood request posted successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error creating request' });
  }
});

// @route   GET /api/requests
// @desc    Get all active requests (with pagination)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const bloodType = req.query.bloodType;
    const requestType = req.query.requestType;

    // Build query
    const query = { status: 'active' };
    if (bloodType && BLOOD_TYPES.includes(bloodType)) {
      query.bloodType = bloodType;
    }
    if (requestType && ['normal', 'emergency'].includes(requestType)) {
      query.requestType = requestType;
    }

    // Sort: emergency requests first, then by creation date
    const requests = await RequestPost.find(query)
      .populate('receiverId', 'fullName email phone')
      .sort({ requestType: -1, createdAt: -1 }) // 'emergency' > 'normal' alphabetically reversed
      .skip(skip)
      .limit(limit);

    const total = await RequestPost.countDocuments(query);

    res.json({
      requests,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRequests: total,
      hasMore: skip + requests.length < total
    });
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// @route   GET /api/requests/my-requests
// @desc    Get current user's requests
// @access  Private (Receiver only)
router.get('/my-requests', auth, roleCheck('receiver'), async (req, res) => {
  try {
    const requests = await RequestPost.find({ receiverId: req.userId })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Fetch my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single request by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await RequestPost.findById(req.params.id)
      .populate('receiverId', 'fullName email phone');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Fetch request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id/status
// @desc    Update request status
// @access  Private (Owner or Admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await RequestPost.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is owner or admin
    if (request.receiverId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['active', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    request.status = status;
    await request.save();

    res.json({ message: 'Request status updated', request });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete request post
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await RequestPost.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is owner or admin
    if (request.receiverId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await RequestPost.findByIdAndDelete(req.params.id);

    // Also delete related notifications
    await Notification.deleteMany({ postId: req.params.id });

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
