import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Reusable webcam component using MediaDevices API.
 * Exposes:
 *  - onCapture(dataUrl) when capture button is clicked
 *  - optional autoCaptureIntervalMs for periodic capture (live attendance)
 */
export default function WebcamCapture({
  onCapture,
  autoCaptureIntervalMs = null,
  showControls = true
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        setError('Unable to access webcam. Please allow camera permissions.');
      }
    }
    init();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    return dataUrl;
  }, []);

  const handleCaptureClick = () => {
    const dataUrl = captureFrame();
    if (dataUrl && onCapture) {
      onCapture(dataUrl);
    }
  };

  useEffect(() => {
    if (!autoCaptureIntervalMs || !isStreaming) return;
    const id = setInterval(() => {
      const dataUrl = captureFrame();
      if (dataUrl && onCapture) {
        onCapture(dataUrl);
      }
    }, autoCaptureIntervalMs);
    return () => clearInterval(id);
  }, [autoCaptureIntervalMs, isStreaming, captureFrame, onCapture]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-[320px] object-cover bg-black"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-200">
            Initializing camera...
          </div>
        )}
      </div>
      {showControls && (
        <button onClick={handleCaptureClick} className="btn-primary w-full">
          Capture Face Image
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

