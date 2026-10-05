import React, { useState, useEffect } from 'react';
import { getMeasurementsApi, updateMeasurementsApi } from '../api';
import { Ruler, Sparkles, CheckCircle2, Info } from 'lucide-react';

const Measurements = () => {
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(72);
  const [chest, setChest] = useState(98);
  const [waist, setWaist] = useState(84);
  const [hips, setHips] = useState(96);
  const [shoulder, setShoulder] = useState(45);
  const [preferredFit, setPreferredFit] = useState('regular');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [sizeRec, setSizeRec] = useState(null);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const res = await getMeasurementsApi();
        if (res.data?.measurements) {
          const m = res.data.measurements;
          setHeight(m.height || 178);
          setWeight(m.weight || 72);
          setChest(m.chest || 98);
          setWaist(m.waist || 84);
          setHips(m.hips || 96);
          setShoulder(m.shoulder || 45);
          setPreferredFit(m.preferredFit || 'regular');
        }
        if (res.data?.sizeRecommendation) {
          setSizeRec(res.data.sizeRecommendation);
        }
      } catch (err) {
        console.log('No existing measurements');
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const res = await updateMeasurementsApi({
        height: Number(height),
        weight: Number(weight),
        chest: Number(chest),
        waist: Number(waist),
        hips: Number(hips),
        shoulder: Number(shoulder),
        preferredFit,
      });

      setMessage('Body measurements updated successfully!');
      if (res.data?.sizeRecommendation) {
        setSizeRec(res.data.sizeRecommendation);
      }
    } catch (err) {
      setError(err.message || 'Failed to update measurements.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container max-width-md">
      <div className="page-header text-center mb-4">
        <h1 className="page-title">
          <Ruler className="inline-icon text-accent" size={32} />
          Body Measurements & Fit Profile
        </h1>
        <p className="page-subtitle">
          Enter your measurements for instant AI size recommendations across all garments
        </p>
      </div>

      {sizeRec && (
        <div className="size-rec-hero-card glass-panel text-center mb-4">
          <div className="hero-rec-badge">
            <Sparkles size={20} className="text-accent" />
            <span>Recommended Standard Size</span>
          </div>
          <div className="hero-size-display">{sizeRec.recommendedSize}</div>
          <p className="hero-advice">{sizeRec.fitAdvice}</p>
        </div>
      )}

      <div className="measurements-card glass-panel">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="measurements-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                className="form-control"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
                min={50}
                max={250}
              />
            </div>

            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                className="form-control"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min={20}
                max={300}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Chest Measurement (cm)</label>
              <input
                type="number"
                className="form-control"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                required
                min={40}
                max={200}
              />
            </div>

            <div className="form-group">
              <label>Waist Measurement (cm)</label>
              <input
                type="number"
                className="form-control"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                required
                min={40}
                max={200}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Hips Measurement (cm)</label>
              <input
                type="number"
                className="form-control"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                required
                min={40}
                max={200}
              />
            </div>

            <div className="form-group">
              <label>Shoulder Width (cm)</label>
              <input
                type="number"
                className="form-control"
                value={shoulder}
                onChange={(e) => setShoulder(e.target.value)}
                min={20}
                max={100}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Preferred Fitting Style</label>
            <div className="fit-selector-group">
              {['tight', 'regular', 'oversized'].map((fit) => (
                <button
                  type="button"
                  key={fit}
                  className={`fit-option-btn ${preferredFit === fit ? 'active' : ''}`}
                  onClick={() => setPreferredFit(fit)}
                >
                  {fit.toUpperCase()} FIT
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg mt-3" disabled={submitting}>
            {submitting ? <div className="spinner-sm"></div> : <CheckCircle2 size={18} />}
            <span>Save Measurements & Recalculate Size</span>
          </button>
        </form>

        <div className="measurement-tips mt-4">
          <Info size={16} />
          <span>Tips: Measure around the fullest part of your chest and narrowest part of your waist for highest accuracy.</span>
        </div>
      </div>
    </div>
  );
};

export default Measurements;
