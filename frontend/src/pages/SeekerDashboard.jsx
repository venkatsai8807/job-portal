import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          api.get('/applications/my'),
          api.get('/jobs'),
        ]);
        setApplications(appsRes.data);
        setRecentJobs(jobsRes.data.slice(0, 3));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-content"><Spinner text="Loading dashboard..." /></div>;

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    pending: applications.filter((a) => a.status === 'applied').length,
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p>Your job search overview at a glance</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Applied</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ background: 'linear-gradient(135deg, var(--warning), #f7b731)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.pending}
          </div>
          <div className="stat-label">In Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ background: 'linear-gradient(135deg, var(--secondary), #00b8a9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.shortlisted}
          </div>
          <div className="stat-label">Shortlisted</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ background: 'linear-gradient(135deg, var(--danger), #ff6b81)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {stats.rejected}
          </div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-title">⚡ Quick Actions</div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '36px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
          🔍 Browse Jobs
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/my-applications')}>
          📋 My Applications
        </button>
      </div>

      {/* Recent Jobs */}
      <div className="section-title">🔥 Recently Posted Jobs</div>
      {recentJobs.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px' }}>
          <p>No jobs available. Check back later!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {recentJobs.map((job) => (
            <div
              key={job._id}
              className="job-card"
              onClick={() => navigate(`/jobs/${job._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${job._id}`)}
            >
              <div className="job-card-header">
                <div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">🏢 {job.company}</div>
                </div>
                <span className="job-type-badge">{job.type}</span>
              </div>
              <div className="job-meta">
                <div className="job-meta-item"><span>📍</span><span>{job.location}</span></div>
                {job.salary && job.salary !== 'Not disclosed' && (
                  <div className="job-meta-item"><span>💰</span><span>{job.salary}</span></div>
                )}
              </div>
              <p className="job-description">{job.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
