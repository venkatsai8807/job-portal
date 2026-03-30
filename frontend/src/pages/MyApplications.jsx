import { useState, useEffect } from 'react';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/applications/my');
        setApplications(data);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (loading) return <div className="page-content"><Spinner text="Loading applications..." /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applications yet</h3>
          <p>Start applying to jobs to track your progress here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            Browse Jobs
          </button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '600px', marginBottom: '28px' }}>
            <div className="stat-card">
              <div className="stat-number">{applications.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ background: 'linear-gradient(135deg, var(--secondary), #00b8a9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {applications.filter((a) => a.status === 'shortlisted').length}
              </div>
              <div className="stat-label">Shortlisted</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ background: 'linear-gradient(135deg, var(--danger), #ff6b81)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {applications.filter((a) => a.status === 'rejected').length}
              </div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.jobId?.title || '—'}</div>
                    </td>
                    <td>{app.jobId?.company || '—'}</td>
                    <td>{app.jobId?.location || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>
                      {formatDate(app.createdAt)}
                    </td>
                    <td>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status === 'applied' ? '⏳ Applied' :
                         app.status === 'shortlisted' ? '✅ Shortlisted' :
                         '❌ Rejected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MyApplications;
