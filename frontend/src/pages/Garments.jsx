import React, { useState, useEffect } from 'react';
import { getGarmentsApi } from '../api';
import GarmentCard from '../components/GarmentCard';
import { Search, Filter, Shirt } from 'lucide-react';

const CATEGORIES = ['All', 'T-Shirt', 'Shirt', 'Jeans'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

const Garments = () => {
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGarments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedSize !== 'All') params.size = selectedSize;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await getGarmentsApi(params);
      setGarments(res.data.garments || []);
    } catch (err) {
      setError(err.message || 'Failed to load garment catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarments();
  }, [selectedCategory, selectedSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGarments();
  };

  return (
    <div className="page-container max-width">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Shirt className="inline-icon text-accent" size={32} />
            Garment Catalog
          </h1>
          <p className="page-subtitle">
            Explore 3D garment models & virtual try-on collections
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-card glass-panel">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="input-with-icon search-input flex-1">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search garments by name, description, or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="category-pills">
          <span className="filter-label">
            <Filter size={14} /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="size-filter-row">
          <span className="filter-label">Size:</span>
          {SIZES.map((sz) => (
            <button
              key={sz}
              className={`size-pill-btn ${selectedSize === sz ? 'active' : ''}`}
              onClick={() => setSelectedSize(sz)}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex-center py-5">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : garments.length === 0 ? (
        <div className="empty-state text-center py-5 glass-panel">
          <Shirt size={48} className="empty-icon" />
          <h3>No garments found</h3>
          <p>Try adjusting your search terms or filters.</p>
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

export default Garments;
