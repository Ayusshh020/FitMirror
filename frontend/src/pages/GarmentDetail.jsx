import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getGarmentByIdApi,
  getSizeRecommendationApi,
  trackAnalyticsEventApi,
  createSavedLookApi,
  uploadUserPhotoApi,
} from '../api';
import { useAuth } from '../context/AuthContext';
import WebcamCapture from '../components/WebcamCapture';
import {
  Sparkles,
  ExternalLink,
  Upload,
  Camera,
  Bookmark,
  Sliders,
  Store,
  RotateCcw,
} from 'lucide-react';

// Returns default overlay: xPct/yPct = top-left corner as % of container,
// wPct/hPct = garment size as % of container width/height.
const getDefaultOverlay = (category = '') => {
  const name = category.toLowerCase();
  if (name.includes('jeans'))  return { xPct: 25, yPct: 45, wPct: 50, hPct: 50 };
  if (name.includes('skirt'))  return { xPct: 25, yPct: 45, wPct: 50, hPct: 45 };
  if (name.includes('shorts')) return { xPct: 25, yPct: 45, wPct: 50, hPct: 40 };
  if (name.includes('dress'))  return { xPct: 20, yPct: 10, wPct: 60, hPct: 78 };
  if (name.includes('hoodie') || name.includes('jacket'))
                               return { xPct: 20, yPct: 10, wPct: 60, hPct: 55 };
  // default: t-shirt / shirt -> upper body
  return { xPct: 22, yPct: 8, wPct: 56, hPct: 50 };
};

const GarmentDetail = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();

  const [garment, setGarment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sizeRec, setSizeRec] = useState(null);

  const [photoSource, setPhotoSource] = useState('profile');
  const [userPhotoUrl, setUserPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [overlay, setOverlay] = useState(getDefaultOverlay());
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const [lookName, setLookName] = useState('');
  const [savingLook, setSavingLook] = useState(false);
  const [lookSavedMessage, setLookSavedMessage] = useState('');

  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) return url;
    const backendHost = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    return `${backendHost}${url}`;
  };

  // ---- Data Fetch ----
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const garmentRes = await getGarmentByIdApi(id);
        const nextGarment = garmentRes.data.garment;
        setGarment(nextGarment);
        setLookName(`${nextGarment.title} Look`);
        setOverlay(getDefaultOverlay(nextGarment.category));

        if (user && user.role === 'user') {
          try {
            const sizeRes = await getSizeRecommendationApi();
            setSizeRec(sizeRes.data.recommendation);
          } catch (err) {
            console.log('No measurements configured for user');
          }
          if (user.photoUrl) {
            setUserPhotoUrl(getFullUrl(user.photoUrl));
          }
        }

        trackAnalyticsEventApi({ garmentId: id, eventType: 'try_on' }).catch((err) =>
          console.error('Track error:', err)
        );
      } catch (err) {
        setError(err.message || 'Garment not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  // ---- Drag: start ----
  const startDrag = useCallback(
    (e) => {
      e.preventDefault(); // prevents ghost image drag and text selection
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      dragRef.current = {
        startClientX: clientX,
        startClientY: clientY,
        startXPct: overlay.xPct,
        startYPct: overlay.yPct,
      };
      setDragging(true);
    },
    [overlay.xPct, overlay.yPct]
  );

  // ---- Drag: move & release (window listeners) ----
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      if (!dragRef.current || !previewRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = previewRef.current.getBoundingClientRect();
      const dxPct = ((clientX - dragRef.current.startClientX) / rect.width) * 100;
      const dyPct = ((clientY - dragRef.current.startClientY) / rect.height) * 100;
      setOverlay((prev) => ({
        ...prev,
        xPct: dragRef.current.startXPct + dxPct,
        yPct: dragRef.current.startYPct + dyPct,
      }));
    };

    const onUp = () => {
      dragRef.current = null;
      setDragging(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchcancel', onUp);
    };
  }, [dragging]);

  // ---- Corner Resize: start ----
  const startResize = useCallback(
    (e, corner) => {
      e.stopPropagation();
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      resizeRef.current = {
        corner,
        startClientX: clientX,
        startClientY: clientY,
        startXPct: overlay.xPct,
        startYPct: overlay.yPct,
        startWPct: overlay.wPct,
        startHPct: overlay.hPct,
      };
      setResizing(true);
    },
    [overlay]
  );

  // ---- Corner Resize: move & release (window listeners) ----
  useEffect(() => {
    if (!resizing) return;

    const onMove = (e) => {
      if (!resizeRef.current || !previewRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = previewRef.current.getBoundingClientRect();
      const dxPct = ((clientX - resizeRef.current.startClientX) / rect.width) * 100;
      const dyPct = ((clientY - resizeRef.current.startClientY) / rect.height) * 100;

      const { corner, startXPct, startYPct, startWPct, startHPct } = resizeRef.current;

      let nextW = startWPct;
      let nextH = startHPct;
      let nextX = startXPct;
      let nextY = startYPct;

      if (corner === 'br') {
        nextW = Math.max(10, startWPct + dxPct);
        nextH = Math.max(10, startHPct + dyPct);
      } else if (corner === 'bl') {
        nextW = Math.max(10, startWPct - dxPct);
        nextX = startXPct + (startWPct - nextW);
        nextH = Math.max(10, startHPct + dyPct);
      } else if (corner === 'tr') {
        nextW = Math.max(10, startWPct + dxPct);
        nextH = Math.max(10, startHPct - dyPct);
        nextY = startYPct + (startHPct - nextH);
      } else if (corner === 'tl') {
        nextW = Math.max(10, startWPct - dxPct);
        nextX = startXPct + (startWPct - nextW);
        nextH = Math.max(10, startHPct - dyPct);
        nextY = startYPct + (startHPct - nextH);
      }

      setOverlay({
        xPct: nextX,
        yPct: nextY,
        wPct: nextW,
        hPct: nextH,
      });
    };

    const onUp = () => {
      resizeRef.current = null;
      setResizing(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchcancel', onUp);
    };
  }, [resizing]);

  const resetOverlay = () => {
    setOverlay(getDefaultOverlay(garment?.category));
  };

  // ---- Photo handlers ----
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploadingPhoto(true);
    try {
      const res = await uploadUserPhotoApi(formData);
      const newPhotoUrl = getFullUrl(res.data.photoUrl);
      setUserPhotoUrl(newPhotoUrl);
      if (res.data.user) updateUser(res.data.user);
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleWebcamCaptured = (dataUrl) => {
    setUserPhotoUrl(dataUrl);
  };

  // ---- Buy / Save ----
  const handleBuyClick = () => {
    trackAnalyticsEventApi({ garmentId: garment._id, eventType: 'purchase_click' }).catch((err) =>
      console.error(err)
    );
    if (garment.purchaseUrl) window.open(garment.purchaseUrl, '_blank');
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith('data:image')) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawCoverImage = (ctx, img, canvasWidth, canvasHeight) => {
    const imageRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;
    if (imageRatio > canvasRatio) {
      drawWidth = canvasHeight * imageRatio;
      drawX = (canvasWidth - drawWidth) / 2;
    } else {
      drawHeight = canvasWidth / imageRatio;
      drawY = (canvasHeight - drawHeight) / 2;
    }
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  const drawPhotoPlaceholder = (ctx, canvasWidth, canvasHeight) => {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, '#e7edf5');
    grad.addColorStop(1, '#b8c6d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#d0a47d';
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, 105, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#546170';
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 74, 190);
    ctx.lineTo(canvasWidth / 2 + 74, 190);
    ctx.lineTo(canvasWidth / 2 + 104, 400);
    ctx.lineTo(canvasWidth / 2 - 104, 400);
    ctx.closePath();
    ctx.fill();
  };

  const createPreviewImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const canvasWidth = 500;
    const canvasHeight = 650;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (userPhotoUrl) {
      const photo = await loadImage(userPhotoUrl);
      drawCoverImage(ctx, photo, canvasWidth, canvasHeight);
    } else {
      drawPhotoPlaceholder(ctx, canvasWidth, canvasHeight);
    }
    const garmentImg = await loadImage(getFullUrl(garment.imageUrl));
    const gx = canvasWidth * (overlay.xPct / 100);
    const gy = canvasHeight * (overlay.yPct / 100);
    const gw = canvasWidth * (overlay.wPct / 100);
    const gh = canvasHeight * (overlay.hPct / 100);
    ctx.drawImage(garmentImg, gx, gy, gw, gh);
    return canvas.toDataURL('image/png');
  };

  const handleSaveLook = async (e) => {
    e.preventDefault();
    if (!lookName.trim()) return;
    setSavingLook(true);
    setLookSavedMessage('');
    try {
      const previewUrl = await createPreviewImage();
      await createSavedLookApi({
        name: lookName.trim(),
        garments: [garment._id],
        previewUrl,
        isPublic: true,
      });
      setLookSavedMessage('Look saved successfully to your profile!');
      setTimeout(() => setLookSavedMessage(''), 4000);
    } catch (err) {
      alert('Save look failed: ' + err.message);
    } finally {
      setSavingLook(false);
    }
  };

  // ---- Render ----
  if (loading) {
    return (
      <div className="flex-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !garment) {
    return (
      <div className="page-container max-width py-5">
        <div className="alert alert-danger">{error || 'Garment not found.'}</div>
      </div>
    );
  }

  const garmentStyle = {
    position: 'absolute',
    left: `${overlay.xPct}%`,
    top: `${overlay.yPct}%`,
    width: `${overlay.wPct}%`,
    height: `${overlay.hPct}%`,
    cursor: dragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
    opacity: 1,
  };

  return (
    <div className="page-container max-width">
      <div className="tryon-page-grid">
        {/* Left: garment details */}
        <div className="garment-detail-left">
          <div className="detail-card glass-panel">
            <span className="badge category-badge mb-2">{garment.category}</span>
            <h1 className="garment-detail-title">{garment.title}</h1>
            <p className="garment-detail-price">${Number(garment.price).toFixed(2)}</p>

            <p className="garment-description">
              {garment.description || 'Try this garment on your photo with a simple 2D overlay.'}
            </p>

            <div className="retailer-info-box">
              <Store size={16} />
              <span>
                Brand: <strong>{garment.retailer?.name || 'Zara Official Retailer'}</strong>
              </span>
            </div>

            {sizeRec && (
              <div className="size-recommendation-box">
                <div className="size-rec-header">
                  <Sparkles size={18} className="text-accent" />
                  <span>Size Recommendation</span>
                </div>
                <div className="recommended-size-badge">{sizeRec.recommendedSize}</div>
                <p className="fit-advice-text">{sizeRec.fitAdvice}</p>
              </div>
            )}

            <div className="available-sizes mb-3">
              <strong>Available Sizes: </strong>
              {garment.availableSizes?.map((s) => (
                <span key={s} className={`size-pill ${sizeRec?.recommendedSize === s ? 'highlight' : ''}`}>
                  {s}
                </span>
              ))}
            </div>

            {garment.purchaseUrl && (
              <button onClick={handleBuyClick} className="btn btn-success btn-lg btn-block mb-3">
                <ExternalLink size={20} />
                <span>Buy Now on Retailer Site</span>
              </button>
            )}

            {user && (
              <form onSubmit={handleSaveLook} className="save-look-box border-top pt-3">
                <h4>Save Outfit Look</h4>
                {lookSavedMessage && <div className="alert alert-success">{lookSavedMessage}</div>}
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Look Name e.g. Office Look 2"
                    value={lookName}
                    onChange={(e) => setLookName(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-outline-purple btn-block" disabled={savingLook}>
                  {savingLook ? <div className="spinner-sm"></div> : <Bookmark size={18} />}
                  <span>Save Look</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: fitting room */}
        <div className="fitting-room-right">
          <div className="fitting-room-card glass-panel">
            <div className="fitting-room-header">
              <h2>
                <Sparkles className="inline-icon text-accent" size={24} /> Virtual Fitting Room
              </h2>
              <p>Upload a body photo or capture one with the webcam.</p>
            </div>

            {/* Photo source tabs */}
            <div className="photo-source-tabs">
              {user?.photoUrl && (
                <button
                  className={`tab-btn ${photoSource === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setPhotoSource('profile');
                    setUserPhotoUrl(getFullUrl(user.photoUrl));
                  }}
                >
                  Saved Photo
                </button>
              )}
              <button
                className={`tab-btn ${photoSource === 'upload' ? 'active' : ''}`}
                onClick={() => setPhotoSource('upload')}
              >
                <Upload size={16} /> Upload Photo
              </button>
              <button
                className={`tab-btn ${photoSource === 'webcam' ? 'active' : ''}`}
                onClick={() => setPhotoSource('webcam')}
              >
                <Camera size={16} /> Webcam
              </button>
            </div>

            {photoSource === 'upload' && (
              <div className="upload-input-panel">
                <label className="upload-box flex-center">
                  <Upload size={32} />
                  <span>{uploadingPhoto ? 'Uploading photo...' : 'Click to select full-body photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            )}

            {photoSource === 'webcam' && (
              <div className="webcam-input-panel">
                <WebcamCapture onPhotoCaptured={handleWebcamCaptured} />
              </div>
            )}

            {/* Try-on preview area */}
            <div className="tryon-preview-wrapper">
              <div
                ref={previewRef}
                className="tryon-preview"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {/* Base: user photo or placeholder */}
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="Your try-on" className="tryon-user-photo" />
                ) : (
                  <div className="tryon-photo-placeholder">
                    <Camera size={44} />
                    <span>Add a photo to preview this item</span>
                  </div>
                )}

                {/* Garment overlay container — draggable with corner resize handles */}
                <div
                  style={garmentStyle}
                  onMouseDown={startDrag}
                  onTouchStart={startDrag}
                  className={`tryon-garment-container${dragging ? ' dragging' : ''}`}
                >
                  <img
                    src={getFullUrl(garment.imageUrl)}
                    alt={garment.title}
                    draggable={false}
                    style={{ width: '100%', height: '100%', pointerEvents: 'none', objectFit: 'fill', display: 'block' }}
                    className="tryon-garment-overlay"
                  />

                  {/* 4 Corner Resize Handles */}
                  <div
                    className="resize-handle corner-tl"
                    onMouseDown={(e) => startResize(e, 'tl')}
                    onTouchStart={(e) => startResize(e, 'tl')}
                  />
                  <div
                    className="resize-handle corner-tr"
                    onMouseDown={(e) => startResize(e, 'tr')}
                    onTouchStart={(e) => startResize(e, 'tr')}
                  />
                  <div
                    className="resize-handle corner-bl"
                    onMouseDown={(e) => startResize(e, 'bl')}
                    onTouchStart={(e) => startResize(e, 'bl')}
                  />
                  <div
                    className="resize-handle corner-br"
                    onMouseDown={(e) => startResize(e, 'br')}
                    onTouchStart={(e) => startResize(e, 'br')}
                  />
                </div>
              </div>
              <p className="tryon-note">
                Grab &amp; drag garment to reposition • Drag corner handles or use sliders to stretch
              </p>
            </div>

            {/* Sliders and reset */}
            <div className="fit-controls-panel">
              <h4>
                <Sliders size={16} /> Adjust Garment Placement
              </h4>
              <div className="control-slider-grid">
                <div className="slider-group">
                  <label>Width: {Math.round(overlay.wPct)}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={overlay.wPct}
                    onChange={(e) => setOverlay((prev) => ({ ...prev, wPct: Number(e.target.value) }))}
                  />
                </div>
                <div className="slider-group">
                  <label>Height: {Math.round(overlay.hPct)}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={overlay.hPct}
                    onChange={(e) => setOverlay((prev) => ({ ...prev, hPct: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <button type="button" className="btn btn-outline btn-sm mt-3" onClick={resetOverlay}>
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarmentDetail;
