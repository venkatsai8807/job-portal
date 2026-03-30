const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllJobs);
router.get('/my', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', getJobById);

// Recruiter only
router.post(
  '/',
  protect,
  authorize('recruiter'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('location').notEmpty().withMessage('Location is required'),
  ],
  createJob
);

router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
