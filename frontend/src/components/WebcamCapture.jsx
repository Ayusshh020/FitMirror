import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';

const getCameraErrorMessage = (errorName) => {
  if (errorName === 'NotAllowedError') {
    return 'Camera permission is blocked. Allow camera access for localhost, then try again.';
  }
  if (errorName === 'NotFoundError') {
    return 'No camera was found on this device.';
  }
  if (errorName === 'NotReadableError') {
    return 'Your camera is being used by another app. Close that app and try again.';
  }
  return 'Unable to open the camera. Please try again.';
};

const WebcamCapture = ({ onPhotoCaptured }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const startingRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    startingRef.current = false;
    setCameraActive(false);
  };

  const startWebcam = async () => {
    if (startingRef.current || streamRef.current) return;

    startingRef.current = true;
    setError('');
    setCapturedImage(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => setCameraActive(true))
            .catch(() => setError('The camera opened, but the video could not start. Try again.'));
        };
      }
    } catch (err) {
      console.error('Webcam access error:', err);
      stopWebcam();
      setError(getCameraErrorMessage(err.name));
    } finally {
      startingRef.current = false;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    stopWebcam();

    if (onPhotoCaptured) {
      onPhotoCaptured(dataUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startWebcam();
  };

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  return (
    <div className="webcam-container">
      {error && (
        <div className="alert alert-danger webcam-error">
          <span>{error}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={startWebcam}>
            Try Again
          </button>
        </div>
      )}

      {!cameraActive && !capturedImage && (
        <div className="webcam-placeholder flex-center">
          <Camera size={48} className="placeholder-icon" />
          <p>Use webcam to capture a try-on photo</p>
          <button className="btn btn-primary" onClick={startWebcam}>
            <Camera size={18} />
            <span>Start Webcam</span>
          </button>
        </div>
      )}

      <div className={`webcam-live-view ${cameraActive && !capturedImage ? 'active' : ''}`}>
        <video ref={videoRef} autoPlay playsInline muted className="webcam-video"></video>
        {cameraActive && !capturedImage && (
          <div className="webcam-overlay-controls">
            <button className="btn btn-success btn-lg" onClick={capturePhoto}>
              <Camera size={20} />
              <span>Capture Photo</span>
            </button>
            <button className="btn btn-outline" onClick={stopWebcam}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {capturedImage && (
        <div className="captured-preview">
          <img src={capturedImage} alt="Captured preview" className="captured-img mirrored-preview" />
          <div className="captured-actions">
            <span className="badge badge-success">
              <CheckCircle size={14} /> Photo Ready
            </span>
            <button className="btn btn-outline btn-sm" onClick={retakePhoto}>
              <RefreshCw size={14} /> Retake
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default WebcamCapture;
