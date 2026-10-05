from __future__ import annotations

import json
import logging
from datetime import datetime, date

from database import execute_commit, query_all, query_one

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Create tables if they do not exist and insert a dummy student."""
    # Users table (for admin sign up / sign in)
    execute_commit(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    # Students table
    execute_commit(
        """
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    # Face encodings table – encoding stored as JSON array of floats
    execute_commit(
        """
        CREATE TABLE IF NOT EXISTS face_encodings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            encoding TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        )
        """
    )

    # Attendance table – one record per student per day
    execute_commit(
        """
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        )
        """
    )

    # Insert a dummy student if table is empty (for testing the dashboard)
    row = query_one("SELECT COUNT(*) as cnt FROM students")
    if row and row["cnt"] == 0:
        now = datetime.utcnow().isoformat()
        logger.info("Inserting dummy student for initial data.")
        execute_commit(
            """
            INSERT INTO students (student_id, name, department, created_at)
            VALUES (?, ?, ?, ?)
            """,
            ("DUMMY001", "Dummy Student", "Computer Science", now),
        )


def create_user(username: str, password_hash: str) -> int:
    now = datetime.utcnow().isoformat()
    return execute_commit(
        """
        INSERT INTO users (username, password_hash, created_at)
        VALUES (?, ?, ?)
        """,
        (username, password_hash, now),
    )


def get_user_by_username(username: str):
    return query_one("SELECT * FROM users WHERE username = ?", (username,))


def create_student(student_id: str, name: str, department: str) -> int:
    now = datetime.utcnow().isoformat()
    return execute_commit(
        """
        INSERT INTO students (student_id, name, department, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (student_id, name, department, now),
    )


def get_student_by_student_id(student_id: str):
    return query_one("SELECT * FROM students WHERE student_id = ?", (student_id,))


def get_student_by_id(sid: int):
    return query_one("SELECT * FROM students WHERE id = ?", (sid,))


def get_all_students():
    return query_all("SELECT * FROM students ORDER BY created_at DESC")


def add_face_encodings(student_db_id: int, encodings: list[list[float]]) -> None:
    now = datetime.utcnow().isoformat()
    sequences = [
        (student_db_id, json.dumps(enc), now)
        for enc in encodings
    ]
    execute_commit(
        """
        INSERT INTO face_encodings (student_id, encoding, created_at)
        VALUES (?, ?, ?)
        """,
        many=True,
        sequences=sequences,
    )


def get_all_face_encodings():
    return query_all(
        """
        SELECT fe.id, fe.student_id, fe.encoding, s.student_id AS roll_no,
               s.name, s.department
        FROM face_encodings fe
        JOIN students s ON fe.student_id = s.id
        """
    )


def mark_attendance(student_db_id: int) -> bool:
    """
    Mark attendance for student if not already marked for today.
    Returns True if a new record was created, False if duplicate for the day.
    """
    today = date.today().isoformat()
    existing = query_one(
        """
        SELECT id FROM attendance
        WHERE student_id = ? AND date = ?
        """,
        (student_db_id, today),
    )
    if existing:
        return False

    now = datetime.utcnow().isoformat()
    execute_commit(
        """
        INSERT INTO attendance (student_id, timestamp, date)
        VALUES (?, ?, ?)
        """,
        (student_db_id, now, today),
    )
    return True


def get_today_attendance():
    today = date.today().isoformat()
    return query_all(
        """
        SELECT a.id, a.timestamp, a.date,
               s.student_id AS roll_no, s.name, s.department
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = ?
        ORDER BY a.timestamp DESC
        """,
        (today,),
    )


def get_all_attendance():
    return query_all(
        """
        SELECT a.id, a.timestamp, a.date,
               s.student_id AS roll_no, s.name, s.department
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        ORDER BY a.timestamp DESC
        """
    )


def mark_absence(student_db_id: int) -> bool:
    """
    Mark absence for student if not attended the live attendance marked for today.
    Returns true if absence for the day.
    """
    today = date.today().isoformat()
    existing = query_one(
        """
        SELECT id FROM absence
        WHERE student_id = ? AND date = ?
        """,
        (student_db_id, today),
    )
    if existing:
        return False

    now = datetime.utcnow().isoformat()
    execute_commit(
        """
        INSERT INTO absence (student_id, timestamp, date)
        VALUES (?, ?, ?)
        """,
        (student_db_id, now, today),
    )
    return True


def get_today_absence():
    today = date.today().isoformat()
    return query_all(
        """
        SELECT a.id, a.timestamp, a.date,
               s.student_id AS roll_no, s.name, s.department
        FROM absence a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = ?
        ORDER BY a.timestamp DESC
        """,
        (today,),
    )


def get_all_absence():
    return query_all(
        """
        SELECT a.id, a.timestamp, a.date,
               s.student_id AS roll_no, s.name, s.department
        FROM absence a
        JOIN students s ON a.student_id = s.id
        ORDER BY a.timestamp DESC
        """
    )