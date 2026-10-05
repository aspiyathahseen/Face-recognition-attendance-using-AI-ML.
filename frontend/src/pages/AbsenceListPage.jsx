import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

export default function AbsenceListPage() {
  const [allStudents, setAllStudents] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [departments, setDepartments] = useState(["All"]);
  const [availableDates, setAvailableDates] = useState([]);

  // Fetch all students from backend
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      if (res.ok && data.success) {
        // backend returns data.data for students
        const students = data.data || data.students || [];
        setAllStudents(students);
        const depts = ["All", ...new Set(students.map((s) => s.department))];
        setDepartments(depts);
      }
    } catch (err) {
      // silently handle
    }
  };

  // Fetch all attendance records from backend
  const fetchAllAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/all`);
      const data = await res.json();
      if (res.ok && data.success) {
        // backend returns data.data for attendance
        const attendance = data.data || data.attendance || [];
        setAllAttendance(attendance);
        // Get unique dates sorted newest first
        const dates = [...new Set(attendance.map((a) => a.date))].sort(
          (a, b) => new Date(b) - new Date(a),
        );
        setAvailableDates(dates);
        // Default to most recent date
        if (dates.length > 0) {
          setFilterDate(dates[0]);
        }
      }
    } catch (err) {
      // silently handle
    }
  };

  // Calculate absences: students NOT in attendance for selected date
  const calculateAbsences = () => {
    if (!filterDate || allStudents.length === 0) return;
    const presentOnDate = allAttendance.filter((a) => a.date === filterDate);
    // backend uses student_id (roll number) to identify students
    const presentRollNos = new Set(
      presentOnDate.map((a) => a.student_id || a.roll_no),
    );
    const absentStudents = allStudents
      .filter((s) => !presentRollNos.has(s.student_id || s.id))
      .map((s) => ({ ...s, date: filterDate }));
    setAbsences(absentStudents);
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStudents();
      await fetchAllAttendance();
      setLoading(false);
    };
    loadData();
  }, []);

  // Recalculate when date or data changes
  useEffect(() => {
    if (allStudents.length > 0) {
      calculateAbsences();
    }
  }, [allStudents, allAttendance, filterDate]);

  // Refresh
  const handleRefresh = async () => {
    setLoading(true);
    await fetchStudents();
    await fetchAllAttendance();
    setLoading(false);
  };

  // Get present count for a given date
  const getPresentCount = (date) => {
    return new Set(
      allAttendance
        .filter((a) => a.date === date)
        .map((a) => a.student_id || a.roll_no),
    ).size;
  };

  // Filter absences by search and department
  const filteredAbsences = absences.filter((s) => {
    const matchesSearch =
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.student_id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "All" || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Absence List
            </h2>
            <p className="text-xs text-slate-500">
              View absent students for any date — all days history included
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Select Date to View Absences
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
          <div className="flex flex-wrap gap-2">
            {availableDates.slice(0, 5).map((date) => (
              <button
                key={date}
                onClick={() => setFilterDate(date)}
                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  filterDate === date
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900">
            {loading ? "..." : allStudents.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Students</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {loading ? "..." : filterDate ? getPresentCount(filterDate) : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Present on {filterDate || "—"}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">
            {loading ? "..." : absences.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Absent on {filterDate || "—"}
          </p>
        </div>
      </div>

      {/* Search and Department Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Absence Table */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Absent Students on {filterDate || "—"} ({filteredAbsences.length})
        </h3>

        {loading && (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500">Loading absence data...</p>
          </div>
        )}

        {!loading && filterDate === "" && (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500">
              Please select a date to view absences.
            </p>
          </div>
        )}

        {!loading && filterDate !== "" && absences.length === 0 && (
          <div className="text-center py-10">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-medium text-green-600">
              All students were present on {filterDate}!
            </p>
          </div>
        )}

        {!loading && absences.length > 0 && filteredAbsences.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500">
              No students found matching your search.
            </p>
          </div>
        )}

        {!loading && filteredAbsences.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Student ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsences.map((student, index) => (
                  <tr
                    key={student.id || index}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono text-xs">
                      {student.student_id}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {student.department}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {student.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge-warning">Absent</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Days Summary Table */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          All Days Attendance Summary
        </h3>
        {loading ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">Loading...</p>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">
              No attendance records found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Present
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Absent
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Attendance Rate
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {availableDates.map((date) => {
                  const presentCount = getPresentCount(date);
                  const absentCount = allStudents.length - presentCount;
                  const rate =
                    allStudents.length > 0
                      ? Math.round((presentCount / allStudents.length) * 100)
                      : 0;
                  return (
                    <tr
                      key={date}
                      className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${filterDate === date ? "bg-blue-50" : ""}`}
                    >
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">
                          {presentCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">
                          {absentCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 w-20">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600">
                            {rate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setFilterDate(date)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Absences
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && filterDate !== "" && (
        <div className="card bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            Showing {filteredAbsences.length} of {absences.length} absent
            students on {filterDate} · Attendance rate:{" "}
            <span className="font-semibold text-green-600">
              {allStudents.length > 0
                ? Math.round(
                    (getPresentCount(filterDate) / allStudents.length) * 100,
                  )
                : 0}
              %
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
