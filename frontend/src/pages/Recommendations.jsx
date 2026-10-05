import React, { useState, useEffect } from 'react';
import { getRecommendationsApi } from '../api';
import GarmentCard from '../components/GarmentCard';
import { Sparkles, Shirt, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Recommendations = () => {
  const [garments, setGarments] = useState([]);
  const [recommendedSize, setRecommendedSize] = useState('');
  const [fitAdvice, setFitAdvice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await getRecommendationsApi();
        setGarments(res.data.garments || []);
        setRecommendedSize(res.data.recommendedSize || '');
        setFitAdvice(res.data.fitAdvice || '');
      } catch (err) {
        setError(err.message || 'Failed to fetch recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="page-container max-width">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles className="inline-icon text-accent" size={32} />
            Recommended Garments
          </h1>
          <p className="page-subtitle">
            Garments recommended based on your body measurements and preferred fit.
          </p>
        </div>
      </div>

      {recommendedSize && (
        <div className="size-banner-card glass-panel mb-4 flex-between">
          <div>
            <h3>Your Recommended Fitting Size: <span className="text-accent">{recommendedSize}</span></h3>
            <p className="banner-advice">{fitAdvice}</p>
          </div>
          <Link to="/measurements" className="btn btn-outline btn-sm">
            Update Measurements
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex-center py-5">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : garments.length === 0 ? (
        <div className="empty-state text-center py-5 glass-panel">
          <Shirt size={48} className="empty-icon" />
          <h3>No recommended garments found</h3>
          <p>Please update your body measurements to calculate recommendations.</p>
          <Link to="/measurements" className="btn btn-primary mt-3">
            Set Measurements
          </Link>
        </div>
      ) : (
        <div className="garments-grid">
          {garments.map((garment) => (
            <GarmentCard key={garment._id} garment={garment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
