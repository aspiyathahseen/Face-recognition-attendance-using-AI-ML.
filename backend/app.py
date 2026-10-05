import logging

from flask import Flask, jsonify
from flask_cors import CORS

from models import init_db
from routes.auth import auth_bp
from routes.register import register_bp
from routes.attendance import attendance_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    )

    # Initialize database and tables
    init_db()

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(attendance_bp)
    

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok"}), 200

    return app


app = create_app()


if __name__ == "__main__":
    # Development server
    app.run(host="0.0.0.0", port=5000, debug=True)

