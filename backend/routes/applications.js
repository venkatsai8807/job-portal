const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// Seeker routes
router.post('/:jobId', protect, authorize('seeker'), applyToJob);
router.get('/my', protect, authorize('seeker'), getMyApplications);

// Recruiter routes
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplicants);
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
