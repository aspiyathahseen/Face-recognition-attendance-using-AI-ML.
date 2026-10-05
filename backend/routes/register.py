from flask import Blueprint, jsonify, request

from face_utils import decode_base64_image, extract_face_encodings_from_image, encoding_to_json_array
from models import create_student, get_student_by_student_id, add_face_encodings

register_bp = Blueprint("register", __name__, url_prefix="/api")


@register_bp.route("/register", methods=["POST"])
def register_student():
    """
    Register a student with multiple face images.

    Expected JSON body:
    {
        "student_id": "S001",
        "name": "John Doe",
        "department": "CSE",
        "images": ["data:image/jpeg;base64,...", ...]  # 5–10 images recommended
    }
    """
    data = request.get_json(silent=True) or {}

    student_id = data.get("student_id")
    name = data.get("name")
    department = data.get("department")
    images = data.get("images") or []

    if not student_id or not name or not department:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    if len(images) < 3:
        return jsonify(
            {
                "success": False,
                "message": "Please provide at least 3 face images (5–10 recommended).",
            }
        ), 400

    # Prevent duplicate student_id
    existing = get_student_by_student_id(student_id)
    if existing:
        return jsonify({"success": False, "message": "Student ID already exists"}), 400

    # Create student
    student_db_id = create_student(student_id, name, department)

    all_encodings_json = []
    valid_images = 0

    for img_str in images:
        try:
            img_array = decode_base64_image(img_str)
            encodings = extract_face_encodings_from_image(img_array)
            if not encodings:
                continue
            # Use the first face in the image
            all_encodings_json.append(encoding_to_json_array(encodings[0]))
            valid_images += 1
        except Exception:
            # Ignore problematic images but continue
            continue

    if valid_images == 0:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "No valid face detected in the provided images.",
                }
            ),
            400,
        )

    add_face_encodings(student_db_id, all_encodings_json)

    return jsonify(
        {
            "success": True,
            "message": f"Student registered with {valid_images} valid face images.",
        }
    ), 201

