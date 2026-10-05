from flask import Blueprint, jsonify, request

from face_utils import decode_base64_image, recognize_face_from_image
from models import (
    get_all_students,
    get_all_attendance,
    get_student_by_id,
    get_today_attendance,
    mark_attendance,
)

attendance_bp = Blueprint("attendance", __name__, url_prefix="/api")


@attendance_bp.route("/recognize", methods=["POST"])
def recognize():
    """
    Recognize a face in a single frame.

    Expected JSON body:
    {
        "image": "data:image/jpeg;base64,..."
    }
    """
    data = request.get_json(silent=True) or {}
    image_str = data.get("image")

    if not image_str:
        return jsonify({"success": False, "message": "No image provided"}), 400

    img_array = decode_base64_image(image_str)
    match, distance = recognize_face_from_image(img_array)

    if not match:
        return jsonify(
            {
                "success": True,
                "recognized": False,
                "label": "Unknown",
                "distance": distance,
            }
        ), 200

    return jsonify(
        {
            "success": True,
            "recognized": True,
            "student": {
                "student_id": match["student_id"],
                "name": match["name"],
                "department": match["department"],
                "student_db_id": match["student_db_id"],
            },
            "distance": distance,
        }
    ), 200


@attendance_bp.route("/attendance", methods=["POST"])
def mark_attendance_api():
    """
    Mark attendance for a recognized student.

    Expected JSON body:
    {
        "student_db_id": 1
    }
    """
    data = request.get_json(silent=True) or {}
    student_db_id = data.get("student_db_id")

    if student_db_id is None:
        return jsonify({"success": False, "message": "student_db_id is required"}), 400

    student = get_student_by_id(int(student_db_id))
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    created = mark_attendance(int(student_db_id))
    if not created:
        return jsonify(
            {
                "success": True,
                "already_marked": True,
                "message": "Attendance already marked for today.",
            }
        ), 200

    return jsonify(
        {
            "success": True,
            "already_marked": False,
            "message": "Attendance marked successfully.",
        }
    ), 201


@attendance_bp.route("/attendance/today", methods=["GET"])
def get_today_attendance_api():
    rows = get_today_attendance()
    data = [
        {
            "id": r["id"],
            "timestamp": r["timestamp"],
            "date": r["date"],
            "student_id": r["roll_no"],
            "name": r["name"],
            "department": r["department"],
        }
        for r in rows
    ]
    return jsonify({"success": True, "data": data}), 200


@attendance_bp.route("/attendance/all", methods=["GET"])
def get_all_attendance_api():
    rows = get_all_attendance()
    data = [
        {
            "id": r["id"],
            "timestamp": r["timestamp"],
            "date": r["date"],
            "student_id": r["roll_no"],
            "name": r["name"],
            "department": r["department"],
        }
        for r in rows
    ]
    return jsonify({"success": True, "data": data}), 200


@attendance_bp.route("/students", methods=["GET"])
def get_students_api():
    rows = get_all_students()
    data = [
        {
            "id": r["id"],
            "student_id": r["student_id"],
            "name": r["name"],
            "department": r["department"],
            "created_at": r["created_at"],
        }
        for r in rows
    ]
    return jsonify({"success": True, "data": data}), 200

