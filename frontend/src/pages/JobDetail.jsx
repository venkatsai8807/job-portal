import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch {
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    // Check if already applied
    const checkApplied = async () => {
      if (!user || user.role !== 'seeker') return;
      try {
        const { data } = await api.get('/applications/my');
        const alreadyApplied = data.some((app) => app.jobId?._id === id);
        setApplied(alreadyApplied);
      } catch {
        // ignore
      }
    };

    fetchJob();
    checkApplied();
  }, [id, user, navigate]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/applications/${id}`, { coverLetter });
      setApplied(true);
      setShowModal(false);
      toast.success('Application submitted successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="page-content"><Spinner text="Loading job details..." /></div>;
  if (!job) return null;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-content">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
        ← Back
      </button>

      <div className="job-detail-layout">
        <div className="job-detail-main">
          <div className="job-detail-title">{job.title}</div>
          <div className="job-detail-company">{job.company}</div>

          <div className="job-meta" style={{ marginBottom: '28px' }}>
            <div className="job-meta-item"><span>📍</span><span>{job.location}</span></div>
            <div className="job-meta-item"><span>💼</span><span>{job.type}</span></div>
            {job.salary && job.salary !== 'Not disclosed' && (
              <div className="job-meta-item"><span>💰</span><span>{job.salary}</span></div>
            )}
            <div className="job-meta-item"><span>📅</span><span>Posted {formatDate(job.createdAt)}</span></div>
          </div>

          {job.skills?.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div className="section-title">Required Skills</div>
              <div className="job-skills">
                {job.skills.map((s, i) => (
                  <span key={i} className="skill-tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="section-title">Job Description</div>
          <p className="job-detail-description">{job.description}</p>
        </div>

        <div className="job-detail-sidebar">
          <div className="section-title">About the Role</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Company</div>
              <div style={{ fontWeight: 600 }}>{job.company}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Location</div>
              <div style={{ fontWeight: 600 }}>{job.location}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Job Type</div>
              <div style={{ fontWeight: 600 }}>{job.type}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Salary</div>
              <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                {job.salary === 'Not disclosed' ? 'Not Disclosed' : job.salary}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Posted By</div>
              <div style={{ fontWeight: 600 }}>{job.createdBy?.name}</div>
            </div>
          </div>

          {user?.role === 'seeker' ? (
            applied ? (
              <div style={{ textAlign: 'center', padding: '14px', background: 'var(--secondary-light)', borderRadius: 'var(--radius-sm)', color: 'var(--secondary)', fontWeight: 600 }}>
                ✅ Already Applied
              </div>
            ) : (
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowModal(true)}>
                Apply Now →
              </button>
            )
          ) : !user ? (
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/login')}>
              Login to Apply
            </button>
          ) : null}
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Apply for {job.title}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Letter (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Tell the recruiter why you're a great fit..."
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                maxLength={1000}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                {coverLetter.length}/1000
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
