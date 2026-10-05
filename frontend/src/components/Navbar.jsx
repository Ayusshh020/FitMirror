import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shirt,
  Sparkles,
  Ruler,
  Bookmark,
  BarChart3,
  Bell,
  LogOut,
  User as UserIcon,
  X,
  CheckCircle2,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, notifications, toastNotification, setToastNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="navbar-container">
        <div className="navbar-inner max-width">
          <Link to="/" className="brand-logo">
            <div className="logo-icon-bg">
              <Sparkles size={22} className="logo-icon" />
            </div>
            <span className="brand-text">Fit<span className="gradient-text">Mirror</span></span>
          </Link>

          {user && (
            <nav className="nav-links">
              {user.role === 'user' && (
                <>
                  <Link to="/garments" className={`nav-item ${isActive('/garments') ? 'active' : ''}`}>
                    <Shirt size={18} />
                    <span>Catalog</span>
                  </Link>
                  <Link to="/recommendations" className={`nav-item ${isActive('/recommendations') ? 'active' : ''}`}>
                    <Sparkles size={18} />
                    <span>Recommendations</span>
                  </Link>
                  <Link to="/measurements" className={`nav-item ${isActive('/measurements') ? 'active' : ''}`}>
                    <Ruler size={18} />
                    <span>Measurements</span>
                  </Link>
                  <Link to="/saved-looks" className={`nav-item ${isActive('/saved-looks') ? 'active' : ''}`}>
                    <Bookmark size={18} />
                    <span>Saved Looks</span>
                  </Link>
                </>
              )}

              {user.role === 'retailer' && (
                <>
                  <Link to="/garments" className={`nav-item ${isActive('/garments') ? 'active' : ''}`}>
                    <Shirt size={18} />
                    <span>Garments</span>
                  </Link>
                  <Link to="/retailer" className={`nav-item ${isActive('/retailer') ? 'active' : ''}`}>
                    <BarChart3 size={18} />
                    <span>Retailer Dashboard</span>
                  </Link>
                </>
              )}
            </nav>
          )}

          <div className="navbar-right">
            {user ? (
              <>
                {/* Real-time Notifications Bell */}
                <div className="notif-wrapper">
                  <button
                    className="icon-btn"
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    title="Notifications"
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <span className="notif-badge">{notifications.length}</span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <h4>Notifications</h4>
                        <button className="close-btn" onClick={() => setShowNotifMenu(false)}>
                          <X size={16} />
                        </button>
                      </div>
                      <div className="notif-body">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">No new notifications</div>
                        ) : (
                          notifications.map((n, idx) => (
                            <div key={n._id || idx} className="notif-item">
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-msg">{n.message}</div>
                              <div className="notif-time">
                                {new Date(n.createdAt || Date.now()).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Pill */}
                <div className="user-profile-pill">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="user-avatar-img" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <div className="user-info-text">
                    <span className="user-name">{user.name}</span>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </div>
                </div>

                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout} title="Logout">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Socket Real-time Toast Alert */}
      {toastNotification && (
        <div className="toast-notification">
          <CheckCircle2 size={24} className="toast-icon" />
          <div className="toast-content">
            <h5 className="toast-title">{toastNotification.title}</h5>
            <p className="toast-msg">{toastNotification.message}</p>
          </div>
          <button className="toast-close" onClick={() => setToastNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
