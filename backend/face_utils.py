import base64
import io
import json
import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from PIL import Image
import face_recognition

from models import get_all_face_encodings

logger = logging.getLogger(__name__)


def decode_base64_image(data_url: str) -> np.ndarray:
    """
    Decode a base64 data URL image (from browser canvas) to a RGB numpy array.
    """
    # data_url format: "data:image/jpeg;base64,...."
    if "," in data_url:
        _, b64data = data_url.split(",", 1)
    else:
        b64data = data_url

    image_bytes = base64.b64decode(b64data)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


def extract_face_encodings_from_image(image_array: np.ndarray) -> List[np.ndarray]:
    """
    Given an RGB image array, detect faces and return face encodings.
    If no faces are found, returns an empty list.
    """
    face_locations = face_recognition.face_locations(image_array)
    encodings = face_recognition.face_encodings(image_array, face_locations)
    return encodings


def encoding_to_json_array(encoding: np.ndarray) -> List[float]:
    return [float(x) for x in encoding.tolist()]


def json_array_to_encoding(data: str) -> np.ndarray:
    arr = json.loads(data)
    return np.array(arr, dtype="float64")


def load_known_faces() -> List[Dict[str, Any]]:
    """
    Load all known face encodings from the database.
    Returns a list of dicts with:
      { "encoding": np.ndarray, "student_db_id": int, "student_id": str, "name": str, "department": str }
    """
    records = get_all_face_encodings()
    known_faces = []
    for row in records:
        try:
            encoding = json_array_to_encoding(row["encoding"])
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Failed to parse encoding for id %s: %s", row["id"], exc)
            continue

        known_faces.append(
            {
                "encoding": encoding,
                "student_db_id": row["student_id"],
                "student_id": row["roll_no"],
                "name": row["name"],
                "department": row["department"],
            }
        )
    return known_faces


def recognize_face_from_image(
    image_array: np.ndarray,
    tolerance: float = 0.5,
) -> Tuple[Optional[Dict[str, Any]], Optional[float]]:
    """
    Recognize a face in the given image.

    Returns (match_dict, distance) where match_dict contains student info if matched,
    or (None, None) if no known face is recognized.
    """
    encodings = extract_face_encodings_from_image(image_array)
    if not encodings:
        return None, None

    face_encoding = encodings[0]
    known_faces = load_known_faces()
    if not known_faces:
        return None, None

    known_encodings = [f["encoding"] for f in known_faces]
    distances = face_recognition.face_distance(known_encodings, face_encoding)

    best_idx = int(np.argmin(distances))
    best_distance = float(distances[best_idx])

    logger.debug("Best face distance: %f", best_distance)

    if best_distance <= tolerance:
        return known_faces[best_idx], best_distance

    return None, best_distance

