from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from models import create_user, get_user_by_username

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Admin sign-up endpoint.

    Expected JSON body:
    {
        "username": "admin1",
        "password": "secret123"
    }
    """
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."}), 400

    existing = get_user_by_username(username)
    if existing:
        return jsonify({"success": False, "message": "Username already exists."}), 400

    password_hash = generate_password_hash(password)
    create_user(username, password_hash)

    return jsonify({"success": True, "message": "Account created. You can now sign in."}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Admin sign-in endpoint.
    """
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    user = get_user_by_username(username)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid username or password."}), 401

    # In a real system you would return a JWT or session token.
    return jsonify({"success": True, "message": "Login successful."}), 200

