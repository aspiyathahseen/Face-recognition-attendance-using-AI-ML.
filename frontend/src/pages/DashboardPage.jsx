import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [todayAbsence, setTodayAbsence] = useState([]);
  const [allAbsence, setAllAbsence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [sRes, tRes, aRes] = await Promise.all([
          fetch(`${API_BASE}/students`),
          fetch(`${API_BASE}/attendance/today`),
          fetch(`${API_BASE}/attendance/all`),
        ]);
        const [sData, tData, aData] = await Promise.all([
          sRes.json(),
          tRes.json(),
          aRes.json(),
        ]);
        if (sRes.ok && sData.success) setStudents(sData.data);
        if (tRes.ok && tData.success) setTodayAttendance(tData.data);
        if (aRes.ok && aData.success) setAllAttendance(aData.data);
      } catch (err) {
        setError("Failed to load data. Is backend running?");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalStudents = students.length;
  const todayCount = todayAttendance.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Overview of registered students and attendance logs.
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="text-xs text-slate-500 mb-1">Total Students</div>
          <div className="text-2xl font-semibold text-slate-900">
            {totalStudents}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500 mb-1">
            Today&apos;s Attendance
          </div>
          <div className="text-2xl font-semibold text-emerald-600">
            {todayCount}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500 mb-1">
            Total Attendance Records
          </div>
          <div className="text-2xl font-semibold text-blue-600">
            {allAttendance.length}
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Registered Students
            </h2>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left py-2 pr-3 font-medium">
                    Student ID
                  </th>
                  <th className="text-left py-2 pr-3 font-medium">Name</th>
                  <th className="text-left py-2 font-medium">Department</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{s.student_id}</td>
                    <td className="py-2 pr-3">{s.name}</td>
                    <td className="py-2">{s.department}</td>
                  </tr>
                ))}
                {students.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="py-3 text-slate-400 italic">
                      No students registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Today&apos;s Attendance
            </h2>
            <span className="badge-info">Latest first</span>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left py-2 pr-3 font-medium">Student</th>
                  <th className="text-left py-2 pr-3 font-medium">
                    Department
                  </th>
                  <th className="text-left py-2 font-medium">Time (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {a.student_id}
                      </div>
                    </td>
                    <td className="py-2 pr-3">{a.department}</td>
                    <td className="py-2 text-[11px] text-slate-600">
                      {a.timestamp}
                    </td>
                  </tr>
                ))}
                {todayAttendance.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="py-3 text-slate-400 italic">
                      No attendance marked today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-900">
            All Attendance Records
          </h2>
          <span className="badge-info">Most recent first</span>
        </div>
        <div className="max-h-80 overflow-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left py-2 pr-3 font-medium">Student</th>
                <th className="text-left py-2 pr-3 font-medium">Department</th>
                <th className="text-left py-2 pr-3 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {allAttendance.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {a.student_id}
                    </div>
                  </td>
                  <td className="py-2 pr-3">{a.department}</td>
                  <td className="py-2 pr-3">{a.date}</td>
                  <td className="py-2 text-[11px] text-slate-600">
                    {a.timestamp}
                  </td>
                </tr>
              ))}
              {allAttendance.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-3 text-slate-400 italic">
                    No attendance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
