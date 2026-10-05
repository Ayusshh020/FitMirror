import React, { useState, useEffect } from 'react';
import {
  getGarmentsApi,
  createGarmentApi,
  updateGarmentApi,
  deleteGarmentApi,
  getConversionAnalyticsApi,
  sendNotificationApi,
} from '../api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  PlusCircle,
  Shirt,
  TrendingUp,
  MousePointerClick,
  Sparkles,
  Trash2,
  Edit,
  Send,
  X,
} from 'lucide-react';

const CATEGORIES = ['Shirt', 'T-Shirt', 'Pants', 'Jacket', 'Dress', 'Suit', 'Other'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const RetailerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'garments', 'notify'

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) return url;
    const backendHost = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    return `${backendHost}${url}`;
  };

  // Garments State
  const [garments, setGarments] = useState([]);
  const [loadingGarments, setLoadingGarments] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Modal / Form State
  const [showModal, setShowModal] = useState(false);
  const [editingGarment, setEditingGarment] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Shirt');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('M');
  const [availableSizes, setAvailableSizes] = useState(['S', 'M', 'L', 'XL']);
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Real-time Notification Dispatch State
  const [recipientId, setRecipientId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');

  const fetchRetailerData = async () => {
    setLoadingGarments(true);
    setLoadingAnalytics(true);
    try {
      const [garmentRes, analyticsRes] = await Promise.all([
        getGarmentsApi({ retailer: user._id }),
        getConversionAnalyticsApi(),
      ]);
      setGarments(garmentRes.data.garments || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      console.error('Error fetching retailer data:', err);
    } finally {
      setLoadingGarments(false);
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchRetailerData();
    }
  }, [user]);

  const openCreateModal = () => {
    setEditingGarment(null);
    setTitle('');
    setDescription('');
    setCategory('Shirt');
    setPrice('');
    setSize('M');
    setAvailableSizes(['S', 'M', 'L', 'XL']);
    setPurchaseUrl('');
    setImageFile(null);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (g) => {
    setEditingGarment(g);
    setTitle(g.title);
    setDescription(g.description || '');
    setCategory(g.category);
    setPrice(g.price);
    setSize(g.size);
    setAvailableSizes(g.availableSizes || ['S', 'M', 'L', 'XL']);
    setPurchaseUrl(g.purchaseUrl || '');
    setImageFile(null);
    setFormError('');
    setShowModal(true);
  };

  const handleSizeToggle = (sz) => {
    if (availableSizes.includes(sz)) {
      setAvailableSizes(availableSizes.filter((s) => s !== sz));
    } else {
      setAvailableSizes([...availableSizes, sz]);
    }
  };

  const handleGarmentFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('size', size);
      formData.append('availableSizes', availableSizes.join(','));
      formData.append('purchaseUrl', purchaseUrl);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingGarment) {
        await updateGarmentApi(editingGarment._id, formData);
      } else {
        if (!imageFile) {
          setFormError('Please select a garment image file to upload.');
          setSubmitting(false);
          return;
        }
        await createGarmentApi(formData);
      }

      setShowModal(false);
      fetchRetailerData();
    } catch (err) {
      setFormError(err.message || 'Garment save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGarment = async (gId) => {
    if (!window.confirm('Delete this garment model permanently?')) return;
    try {
      await deleteGarmentApi(gId);
      fetchRetailerData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendingNotif(true);
    setNotifSuccess('');

    try {
      await sendNotificationApi({
        recipientId: recipientId.trim(),
        title: notifTitle.trim(),
        message: notifMessage.trim(),
      });
      setNotifSuccess('Real-time notification emitted via Socket.io!');
      setRecipientId('');
      setNotifTitle('');
      setNotifMessage('');
    } catch (err) {
      alert('Failed to send notification: ' + err.message);
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div className="page-container max-width">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">
            <BarChart3 className="inline-icon text-accent" size={32} />
            Retailer Dashboard
          </h1>
          <p className="page-subtitle">
            Manage your garment catalog & track fitting room conversion analytics
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <PlusCircle size={18} />
          <span>Add New Garment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dash-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={18} /> Conversion Analytics
        </button>
        <button
          className={`dash-tab ${activeTab === 'garments' ? 'active' : ''}`}
          onClick={() => setActiveTab('garments')}
        >
          <Shirt size={18} /> My Garments ({garments.length})
        </button>
        <button
          className={`dash-tab ${activeTab === 'notify' ? 'active' : ''}`}
          onClick={() => setActiveTab('notify')}
        >
          <Send size={18} /> Socket.io Notifications
        </button>
      </div>

      {/* Tab 1: Conversion Analytics */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          {loadingAnalytics ? (
            <div className="flex-center py-5">
              <div className="spinner"></div>
            </div>
          ) : !analytics ? (
            <div className="alert alert-danger">Failed to load conversion stats</div>
          ) : (
            <>
              {/* Analytics Hero Cards */}
              <div className="stats-hero-grid">
                <div className="stat-card glass-panel">
                  <div className="stat-icon-wrapper text-purple">
                    <Sparkles size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Virtual Try-Ons</span>
                    <h2 className="stat-value">{analytics.overall.totalTryOns}</h2>
                  </div>
                </div>

                <div className="stat-card glass-panel">
                  <div className="stat-icon-wrapper text-success">
                    <MousePointerClick size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Purchase Clicks</span>
                    <h2 className="stat-value">{analytics.overall.totalPurchaseClicks}</h2>
                  </div>
                </div>

                <div className="stat-card glass-panel accent-glow">
                  <div className="stat-icon-wrapper text-accent">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Overall Conversion Rate</span>
                    <h2 className="stat-value text-accent">{analytics.overall.overallConversionRate}</h2>
                  </div>
                </div>
              </div>

              {/* Garment Conversion Table */}
              <div className="table-card glass-panel mt-4">
                <div className="table-header">
                  <h3>Garment Conversion Performance Breakdown</h3>
                </div>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Garment Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Try-Ons</th>
                        <th>Purchase Clicks</th>
                        <th>Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.garments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No garment analytics data yet.
                          </td>
                        </tr>
                      ) : (
                        analytics.garments.map((item) => (
                          <tr key={item.garmentId}>
                            <td className="font-weight-bold">{item.title}</td>
                            <td>
                              <span className="badge category-badge">{item.category}</span>
                            </td>
                            <td>${Number(item.price).toFixed(2)}</td>
                            <td>{item.tryOns}</td>
                            <td>{item.purchaseClicks}</td>
                            <td>
                              <span
                                className={`conversion-tag ${
                                  item.conversionPercentage > 20
                                    ? 'high'
                                    : item.conversionPercentage > 0
                                    ? 'medium'
                                    : 'zero'
                                }`}
                              >
                                {item.conversionRate}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Manage Garments */}
      {activeTab === 'garments' && (
        <div className="garments-section">
          {loadingGarments ? (
            <div className="flex-center py-5">
              <div className="spinner"></div>
            </div>
          ) : garments.length === 0 ? (
            <div className="empty-state text-center py-5 glass-panel">
              <Shirt size={48} className="empty-icon" />
              <h3>No garments uploaded yet</h3>
              <p>Upload your 3D garment models to enable virtual fitting room try-ons.</p>
              <button className="btn btn-primary mt-3" onClick={openCreateModal}>
                <PlusCircle size={18} /> Add First Garment
              </button>
            </div>
          ) : (
            <div className="garments-grid">
              {garments.map((garment) => (
                <div key={garment._id} className="garment-card">
                  <div className="garment-img-container">
                    <img src={getFullUrl(garment.imageUrl)} alt={garment.title} className="garment-img" />
                    <span className="badge category-badge">{garment.category}</span>
                  </div>
                  <div className="garment-info">
                    <h3>{garment.title}</h3>
                    <p className="garment-price">${Number(garment.price).toFixed(2)}</p>
                    <div className="retailer-actions-row mt-2">
                      <button className="btn btn-sm btn-outline" onClick={() => openEditModal(garment)}>
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger-ghost"
                        onClick={() => handleDeleteGarment(garment._id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Real-Time Socket Notifications */}
      {activeTab === 'notify' && (
        <div className="notify-section max-width-md">
          <div className="card glass-panel p-4">
            <h3 className="mb-2 flex-items-center">
              <Send size={20} className="text-accent mr-2" /> Dispatch Real-Time Notification
            </h3>
            <p className="text-muted mb-4">
              Sends an instant notification stored in database & pushed via Socket.io directly to target user's active session.
            </p>

            {notifSuccess && <div className="alert alert-success">{notifSuccess}</div>}

            <form onSubmit={handleSendNotification}>
              <div className="form-group">
                <label>Target User ID (e.g., from seed credentials)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Paste User MongoDB ID"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notification Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. New Summer Collection Dropped!"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Try on our new Oxford Shirts now!"
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={sendingNotif}>
                {sendingNotif ? <div className="spinner-sm"></div> : <Send size={18} />}
                <span>Emit Real-Time Socket Notification</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Garment Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop flex-center">
          <div className="modal-card glass-panel max-width-md">
            <div className="modal-header flex-between">
              <h3>{editingGarment ? 'Edit Garment' : 'Upload New Garment'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleGarmentFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Garment Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Classic Oxford Shirt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="49.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Describe material, fit, and style details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Available Sizes</label>
                <div className="size-selector-pills">
                  {SIZES.map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      className={`size-toggle-pill ${availableSizes.includes(sz) ? 'active' : ''}`}
                      onClick={() => handleSizeToggle(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Direct Purchase Link (purchaseUrl)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://retailer.com/buy/product-1"
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Garment Image File (Local upload via Multer)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </div>

              <div className="modal-footer flex-end gap-2 mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <div className="spinner-sm"></div> : <Sparkles size={18} />}
                  <span>{editingGarment ? 'Update Garment' : 'Upload Garment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerDashboard;
