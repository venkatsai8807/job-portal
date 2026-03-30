import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  title: '',
  description: '',
  company: '',
  location: '',
  salary: '',
  type: 'Full-time',
  skills: '',
};

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [appLoading, setAppLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await api.get('/jobs/my');
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const fetchApplicants = async (jobId) => {
    setSelectedJobId(jobId);
    setAppLoading(true);
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApplicants(data);
    } catch {
      setApplicants([]);
      toast.error('Could not load applicants');
    } finally {
      setAppLoading(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    return errs;
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const openCreateForm = () => {
    setEditingJob(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowJobForm(true);
  };

  const openEditForm = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary || '',
      type: job.type || 'Full-time',
      skills: job.skills?.join(', ') || '',
    });
    setFormErrors({});
    setShowJobForm(true);
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) return setFormErrors(errs);

    setSubmitting(true);
    const payload = {
      ...form,
      skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
        toast.success('Job updated successfully!');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job posted successfully! 🎉');
      }
      setShowJobForm(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted');
      setJobs(jobs.filter((j) => j._id !== jobId));
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setApplicants([]);
      }
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status } : a))
      );
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="page-content"><Spinner text="Loading dashboard..." /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Recruiter Dashboard</h1>
        <p>Manage your job postings and review applicants</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{jobs.length}</div>
          <div className="stat-label">Jobs Posted</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{applicants.length}</div>
          <div className="stat-label">Applicants Shown</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{applicants.filter((a) => a.status === 'shortlisted').length}</div>
          <div className="stat-label">Shortlisted</div>
        </div>
      </div>

      {/* Job postings */}
      <div className="section-title">
        📋 My Job Postings
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={openCreateForm}>
          + Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>No jobs posted yet</h3>
          <p>Create your first job posting to start receiving applications.</p>
          <button className="btn btn-primary" onClick={openCreateForm}>Post a Job</button>
        </div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: '36px' }}>
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{job.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>{job.company}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{job.location}</td>
                  <td>
                    <span className="job-type-badge">{job.type}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(job.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => fetchApplicants(job._id)}
                      >
                        👥 Applicants
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditForm(job)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job._id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicants */}
      {selectedJobId && (
        <>
          <div className="section-title">
            👥 Applicants for: {jobs.find((j) => j._id === selectedJobId)?.title}
          </div>
          {appLoading ? (
            <Spinner text="Loading applicants..." />
          ) : applicants.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">📭</div>
              <h3>No applicants yet</h3>
              <p>Share your job listing to get more visibility.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Cover Letter</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 600 }}>{app.userId?.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>{app.userId?.email}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '200px' }}>
                        {app.coverLetter ? (
                          <span title={app.coverLetter}>
                            {app.coverLetter.substring(0, 60)}{app.coverLetter.length > 60 ? '…' : ''}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(app.createdAt)}</td>
                      <td>
                        <select
                          className="status-select"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        >
                          <option value="applied">⏳ Applied</option>
                          <option value="shortlisted">✅ Shortlisted</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowJobForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingJob ? 'Edit Job' : 'Post a New Job'}</div>
              <button className="modal-close" onClick={() => setShowJobForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitJob}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  name="title"
                  className={`form-input ${formErrors.title ? 'error' : ''}`}
                  placeholder="e.g. Senior React Developer"
                  value={form.title}
                  onChange={handleFormChange}
                />
                {formErrors.title && <span className="form-error">{formErrors.title}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    name="company"
                    className={`form-input ${formErrors.company ? 'error' : ''}`}
                    placeholder="e.g. Acme Corp"
                    value={form.company}
                    onChange={handleFormChange}
                  />
                  {formErrors.company && <span className="form-error">{formErrors.company}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    name="location"
                    className={`form-input ${formErrors.location ? 'error' : ''}`}
                    placeholder="e.g. Remote or New York"
                    value={form.location}
                    onChange={handleFormChange}
                  />
                  {formErrors.location && <span className="form-error">{formErrors.location}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input
                    name="salary"
                    className="form-input"
                    placeholder="e.g. $80k - $100k / yr"
                    value={form.salary}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select name="type" className="form-select" value={form.type} onChange={handleFormChange}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Remote</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input
                  name="skills"
                  className="form-input"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={form.skills}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea
                  name="description"
                  className={`form-textarea ${formErrors.description ? 'error' : ''}`}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={5}
                  value={form.description}
                  onChange={handleFormChange}
                />
                {formErrors.description && <span className="form-error">{formErrors.description}</span>}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowJobForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? 'Saving...' : editingJob ? 'Save Changes' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
