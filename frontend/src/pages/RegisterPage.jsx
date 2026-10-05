import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';

const API_BASE = 'http://localhost:5000/api';

export default function RegisterPage() {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCapture = (dataUrl) => {
    if (images.length >= 10) return;
    setImages((prev) => [...prev, dataUrl]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          name,
          department,
          images
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.message || 'Student registered successfully.');
        setStudentId('');
        setName('');
        setDepartment('');
        setImages([]);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Unable to reach backend. Is Flask running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Student Registration</h2>
        <p className="text-xs text-slate-500 mb-4">
          Capture 5–10 clear face images for reliable recognition.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Student ID</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Captured images:{' '}
              <span className="font-semibold">
                {images.length} / 10
              </span>
            </span>
            <span>
              Status:{' '}
              {images.length >= 5 ? (
                <span className="badge-success">Good ({images.length} images)</span>
              ) : images.length > 0 ? (
                <span className="badge-warning">Need more images</span>
              ) : (
                <span className="badge-info">Waiting</span>
              )}
            </span>
          </div>
          {message && <p className="text-xs text-emerald-600">{message}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full mt-2" disabled={submitting}>
            {submitting ? 'Saving...' : 'Register Student'}
          </button>
        </form>
      </div>
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Webcam Capture</h2>
        <WebcamCapture onCapture={handleCapture} />
        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-700 mb-2">Captured images preview</p>
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`capture-${idx}`}
                  className="h-16 w-full object-cover rounded-md border border-slate-200"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

