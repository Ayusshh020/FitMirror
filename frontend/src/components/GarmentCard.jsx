import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, Tag } from 'lucide-react';
import { trackAnalyticsEventApi } from '../api';

const GarmentCard = ({ garment, onEdit, onDelete, isRetailerOwner }) => {
  const handleBuyClick = (e) => {
    e.stopPropagation();
    // Track purchase_click analytics event
    trackAnalyticsEventApi({ garmentId: garment._id, eventType: 'purchase_click' }).catch((err) =>
      console.error('Track error:', err)
    );
    if (garment.purchaseUrl) {
      window.open(garment.purchaseUrl, '_blank');
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300x400?text=No+Image';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendHost = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    return `${backendHost}${url}`;
  };

  return (
    <div className="garment-card">
      <div className="garment-img-container">
        <img src={getFullImageUrl(garment.imageUrl)} alt={garment.title} className="garment-img" />
        <div className="garment-badges">
          <span className="badge category-badge">{garment.category}</span>
          <span className="badge size-badge">Size: {garment.size}</span>
        </div>
      </div>

      <div className="garment-info">
        <h3 className="garment-title">{garment.title}</h3>
        <p className="garment-price">${Number(garment.price).toFixed(2)}</p>

        {garment.availableSizes && garment.availableSizes.length > 0 && (
          <div className="available-sizes">
            <span className="sizes-label"><Tag size={12} /> Sizes:</span>
            {garment.availableSizes.map((sz) => (
              <span key={sz} className="size-pill">
                {sz}
              </span>
            ))}
          </div>
        )}

        <div className="garment-card-actions">
          <Link to={`/garments/${garment._id}`} className="btn btn-primary btn-block">
            <Sparkles size={16} />
            <span>Try On Virtually</span>
          </Link>

          {garment.purchaseUrl && (
            <button onClick={handleBuyClick} className="btn btn-outline btn-block buy-btn">
              <ExternalLink size={16} />
              <span>Buy Direct</span>
            </button>
          )}
        </div>

        {isRetailerOwner && (
          <div className="retailer-actions-row">
            <button onClick={() => onEdit(garment)} className="btn btn-sm btn-ghost">
              Edit
            </button>
            <button onClick={() => onDelete(garment._id)} className="btn btn-sm btn-danger-ghost">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GarmentCard;
