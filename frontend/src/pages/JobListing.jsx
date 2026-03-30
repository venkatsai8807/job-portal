import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      const { data } = await api.get('/jobs', { params });
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, location]);

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 400);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const formatDate = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  };

  return (
    <div>
      <div className="hero-section">
        <h1>Find Your Next Opportunity</h1>
        <p>Browse thousands of jobs from top companies around the world.</p>

        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="search-title"
              type="text"
              className="form-input"
              placeholder="Job title, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="search-input-wrap">
            <span className="search-icon">📍</span>
            <input
              id="search-location"
              type="text"
              className="form-input"
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <Spinner text="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search filters.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </p>
            <div className="jobs-grid">
              {jobs.map((job) => (
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
                    <div className="job-meta-item">
                      <span>📍</span>
                      <span>{job.location}</span>
                    </div>
                    {job.salary && job.salary !== 'Not disclosed' && (
                      <div className="job-meta-item">
                        <span>💰</span>
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>

                  {job.description && (
                    <p className="job-description">{job.description}</p>
                  )}

                  {job.skills?.length > 0 && (
                    <div className="job-skills">
                      {job.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="job-card-footer">
                    <span className="job-salary">
                      {job.salary === 'Not disclosed' ? '—' : job.salary}
                    </span>
                    <span className="job-date">{formatDate(job.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobListing;
