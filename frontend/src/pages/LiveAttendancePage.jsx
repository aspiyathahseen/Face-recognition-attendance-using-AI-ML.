import React, { useCallback, useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';

const API_BASE = 'http://localhost:5000/api';

export default function LiveAttendancePage() {
  const [status, setStatus] = useState('Idle');
  const [recognizedStudent, setRecognizedStudent] = useState(null);
  const [attendanceInfo, setAttendanceInfo] = useState(null);

  const handleFrame = useCallback(
    async (dataUrl) => {
      try {
        const res = await fetch(`${API_BASE}/recognize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setStatus('Error recognizing face');
          return;
        }

        if (!data.recognized) {
          setRecognizedStudent(null);
          setAttendanceInfo(null);
          setStatus('Unknown face detected');
          return;
        }

        setRecognizedStudent(data.student);
        setStatus(`Recognized: ${data.student.name}`);

        // Auto mark attendance
        const attendRes = await fetch(`${API_BASE}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_db_id: data.student.student_db_id })
        });
        const attendData = await attendRes.json();
        if (attendRes.ok && attendData.success) {
          setAttendanceInfo(attendData);
        }
      } catch (err) {
        setStatus('Backend not reachable');
      }
    },
    []
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="card md:col-span-2">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Live Attendance</h2>
        <p className="text-xs text-slate-500 mb-4">
          Keep your face centered in the frame. The system captures frames every second and marks
          attendance automatically.
        </p>
        <WebcamCapture onCapture={handleFrame} autoCaptureIntervalMs={1000} showControls={false} />
      </div>
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Recognition Status</h3>
          <p className="text-xs text-slate-600 mb-2">{status}</p>
          <div>
            {!recognizedStudent && (
              <span className="badge-warning">Unknown / Not recognized</span>
            )}
            {recognizedStudent && (
              <span className="badge-success">Recognized</span>
            )}
          </div>
        </div>
        {recognizedStudent && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Student Info</h3>
            <div className="text-xs text-slate-700 space-y-1">
              <div>
                <span className="font-medium">Name:</span> {recognizedStudent.name}
              </div>
              <div>
                <span className="font-medium">Student ID:</span> {recognizedStudent.student_id}
              </div>
              <div>
                <span className="font-medium">Department:</span> {recognizedStudent.department}
              </div>
            </div>
          </div>
        )}
        {attendanceInfo && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Attendance Status</h3>
            {attendanceInfo.already_marked ? (
              <span className="badge-info">Attendance already marked today</span>
            ) : (
              <span className="badge-success">Attendance marked just now</span>
            )}
          </div>
        )}
        {!attendanceInfo && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Attendance Status</h3>
            <span className="badge-info">Waiting for recognition</span>
          </div>
        )}
      </div>
    </div>
  );
}

