import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">JobPortal</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>
          Browse Jobs
        </Link>

        {user?.role === 'seeker' && (
          <>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link to="/my-applications" className={`nav-link ${isActive('/my-applications') ? 'active' : ''}`}>
              My Applications
            </Link>
          </>
        )}

        {user?.role === 'recruiter' && (
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
        )}
      </div>

      <div className="navbar-actions">
        {user ? (
          <div className="user-menu">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
