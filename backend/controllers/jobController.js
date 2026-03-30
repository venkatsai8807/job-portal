const Job = require('../models/Job');
const { validationResult } = require('express-validator');

// @desc    Get all jobs (public)
// @route   GET /api/jobs
const getAllJobs = async (req, res) => {
  try {
    const { search, location } = req.query;
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create job (recruiter only)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, company, location, salary, type, skills } =
      req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      type,
      skills: skills || [],
      createdBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update job (recruiter, own job)
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this job' });
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete job (recruiter, own job)
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recruiter's own jobs
// @route   GET /api/jobs/my
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
