import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSavedLookByIdApi } from '../api';
import { Bookmark, Shirt, ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';

const SharedLook = () => {
  const { token } = useParams();
  const [look, setLook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedLook = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getSavedLookByIdApi(token);
        setLook(res.data.savedLook);
      } catch (err) {
        setError(err.message || 'Shared look not found');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedLook();
    } else {
      setError('Shared look not found');
      setLoading(false);
    }
  }, [token]);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) return url;
    const backendHost = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    return `${backendHost}${url}`;
  };

  if (loading) {
    return (
      <div className="flex-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !look) {
    return (
      <div className="page-container max-width-md py-5">
        <div className="empty-state text-center py-5 glass-panel">
          <AlertCircle size={48} className="empty-icon text-danger" />
          <h3>Shared look not found</h3>
          <p>The link you opened might be invalid or the saved look has been deleted.</p>
          <Link to="/garments" className="btn btn-primary mt-3">
            <Shirt size={16} />
            <span>Explore Garment Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-width">
      <div className="mb-4">
        <Link to="/garments" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="page-header">
        <div>
          <span className="badge category-badge mb-2">Shared Outfit Look</span>
          <h1 className="page-title">{look.name}</h1>
          {look.user && (
            <p className="page-subtitle">
              Created by <strong>{look.user.name || 'FitMirror User'}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="tryon-page-grid">
        {/* Left: Saved look preview */}
        <div className="garment-detail-left">
          <div className="detail-card glass-panel text-center">
            <h3>Outfit Preview</h3>
            <div className="look-preview-container mt-3" style={{ height: '360px', borderRadius: '10px', overflow: 'hidden' }}>
              {look.previewUrl ? (
                <img src={getFullUrl(look.previewUrl)} alt={look.name} className="look-preview-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div className="look-placeholder flex-center" style={{ height: '100%' }}>
                  <Bookmark size={48} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Garments included in look */}
        <div className="fitting-room-right">
          <div className="fitting-room-card glass-panel">
            <h2 className="mb-3">
              <Shirt className="inline-icon text-accent" size={24} /> Garments in this Look ({look.garments?.length || 0})
            </h2>

            {look.garments && look.garments.length > 0 ? (
              <div className="garments-grid">
                {look.garments.map((garment) => (
                  <div key={garment._id} className="garment-card">
                    <div className="garment-img-container">
                      <img src={getFullUrl(garment.imageUrl)} alt={garment.title} className="garment-img" />
                    </div>
                    <div className="garment-info">
                      <span className="badge category-badge mb-1">{garment.category}</span>
                      <h4 className="garment-title">{garment.title}</h4>
                      <p className="garment-price">${Number(garment.price).toFixed(2)}</p>
                      <Link to={`/garments/${garment._id}`} className="btn btn-outline btn-block btn-sm">
                        <ExternalLink size={14} />
                        <span>Try On Garment</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No individual garment details available for this look.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedLook;
