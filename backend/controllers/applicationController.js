const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job (seeker)
// @route   POST /api/applications/:jobId
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existing = await Application.findOne({
      userId: req.user._id,
      jobId: req.params.jobId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId: req.params.jobId,
      coverLetter: req.body.coverLetter || '',
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get seeker's own applications
// @route   GET /api/applications/my
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title company location salary type',
        populate: { path: 'createdBy', select: 'name' },
      })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get applicants for a job (recruiter)
// @route   GET /api/applications/job/:jobId
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view applicants for this job' });
    }

    const applications = await Application.find({
      jobId: req.params.jobId,
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['applied', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id).populate(
      'jobId'
    );
    if (!application)
      return res.status(404).json({ message: 'Application not found' });

    if (application.jobId.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
};
