import React, { useState, useEffect } from 'react';
import { getSavedLooksApi, deleteSavedLookApi } from '../api';
import { Bookmark, Share2, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedLooks = () => {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchSavedLooks = async () => {
    try {
      const res = await getSavedLooksApi();
      setLooks(res.data.savedLooks || []);
    } catch (err) {
      setError(err.message || 'Failed to load saved looks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedLooks();
  }, []);

  const handleDelete = async (lookId) => {
    if (!window.confirm('Are you sure you want to delete this look?')) return;
    try {
      await deleteSavedLookApi(lookId);
      setLooks(looks.filter((l) => l._id !== lookId));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleCopyShareLink = (shareToken, lookId) => {
    const shareUrl = `${window.location.origin}/shared-look/${shareToken || lookId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(lookId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) return url;
    const backendHost = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    return `${backendHost}${url}`;
  };

  return (
    <div className="page-container max-width">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bookmark className="inline-icon text-accent" size={32} />
            My Saved Looks
          </h1>
          <p className="page-subtitle">
            Manage your virtual outfit combinations & shareable looks
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center py-5">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : looks.length === 0 ? (
        <div className="empty-state text-center py-5 glass-panel">
          <Bookmark size={48} className="empty-icon" />
          <h3>No saved looks yet</h3>
          <p>Try on clothes in the catalog and click "Save Look" to save outfit combinations.</p>
          <Link to="/garments" className="btn btn-primary mt-3">
            Explore Garment Catalog
          </Link>
        </div>
      ) : (
        <div className="looks-grid">
          {looks.map((look) => (
            <div key={look._id} className="look-card glass-panel">
              <div className="look-preview-container">
                {look.previewUrl ? (
                  <img src={getFullUrl(look.previewUrl)} alt={look.name} className="look-preview-img" />
                ) : (
                  <div className="look-placeholder flex-center">
                    <Bookmark size={36} />
                  </div>
                )}
                <span className={`badge ${look.isPublic ? 'badge-success' : 'badge-secondary'}`}>
                  {look.isPublic ? 'Public Shareable' : 'Private'}
                </span>
              </div>

              <div className="look-info">
                <h3 className="look-title">{look.name}</h3>

                {look.garments && look.garments.length > 0 && (
                  <div className="look-garments-list">
                    <strong>Garments: </strong>
                    {look.garments.map((g) => (
                      <span key={g._id || g} className="garment-tag">
                        {g.title || 'Garment Item'}
                      </span>
                    ))}
                  </div>
                )}

                <div className="look-actions-row">
                  <button
                    onClick={() => handleCopyShareLink(look.shareToken, look._id)}
                    className="btn btn-sm btn-outline-purple flex-1"
                  >
                    {copiedId === look._id ? <Check size={14} /> : <Share2 size={14} />}
                    <span>{copiedId === look._id ? 'Copied Link!' : 'Share Link'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(look._id)}
                    className="btn btn-sm btn-danger-ghost"
                    title="Delete Look"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedLooks;
