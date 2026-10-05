import sqlite3
from pathlib import Path
from typing import Any, Iterable, Optional

DB_PATH = Path(__file__).resolve().parent / "attendance.db"


def get_connection() -> sqlite3.Connection:
    """
    Return a SQLite connection.
    check_same_thread=False so it can be reused across threads in Flask.
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def execute(
    query: str,
    params: Iterable[Any] = (),
    commit: bool = False,
    many: bool = False,
    sequences: Optional[Iterable[Iterable[Any]]] = None,
) -> sqlite3.Cursor:
    """
    Execute a query with optional parameters.
    If commit=True, changes are committed.
    If many=True, executes executemany using provided sequences.
    """
    conn = get_connection()
    cur = conn.cursor()

    if many and sequences is not None:
        cur.executemany(query, sequences)
    else:
        cur.execute(query, params)

    if commit:
        conn.commit()

    return cur


def query_all(query: str, params: Iterable[Any] = ()) -> list[sqlite3.Row]:
    cur = execute(query, params)
    rows = cur.fetchall()
    cur.connection.close()
    return rows


def query_one(query: str, params: Iterable[Any] = ()) -> Optional[sqlite3.Row]:
    cur = execute(query, params)
    row = cur.fetchone()
    cur.connection.close()
    return row


def execute_commit(
    query: str,
    params: Iterable[Any] = (),
    many: bool = False,
    sequences: Optional[Iterable[Iterable[Any]]] = None,
) -> int:
    """
    Execute a write query and commit.
    Returns lastrowid where appropriate.
    """
    conn = get_connection()
    cur = conn.cursor()

    if many and sequences is not None:
        cur.executemany(query, sequences)
    else:
        cur.execute(query, params)

    conn.commit()
    lastrowid = cur.lastrowid
    conn.close()
    return lastrowid

