"""
Optional local webcam recognition loop using OpenCV.

This script opens the laptop webcam, performs real-time face recognition using
the same encodings stored in the database, and prints/logs recognition events.

This is independent of the React frontend, which uses the browser webcam.
"""

import logging

import cv2
import face_recognition
import numpy as np

from face_utils import load_known_faces
from models import mark_attendance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_webcam_loop(camera_index: int = 0, tolerance: float = 0.5) -> None:
    video_capture = cv2.VideoCapture(camera_index)

    if not video_capture.isOpened():
        logger.error("Could not open webcam.")
        return

    logger.info("Starting webcam recognition loop. Press 'q' to quit.")

    while True:
        ret, frame = video_capture.read()
        if not ret:
            logger.error("Failed to read frame from camera.")
            break

        # Convert BGR (OpenCV) to RGB (face_recognition)
        rgb_frame = frame[:, :, ::-1]

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        known_faces = load_known_faces()
        known_encodings = [f["encoding"] for f in known_faces]

        for (top, right, bottom, left), face_encoding in zip(
            face_locations, face_encodings
        ):
            name = "Unknown"
            color = (0, 0, 255)

            if known_encodings:
                distances = face_recognition.face_distance(
                    known_encodings, face_encoding
                )
                best_idx = int(np.argmin(distances))
                best_distance = float(distances[best_idx])

                if best_distance <= tolerance:
                    match = known_faces[best_idx]
                    name = f'{match["student_id"]} - {match["name"]}'
                    color = (0, 255, 0)
                    created = mark_attendance(match["student_db_id"])
                    if created:
                        logger.info("Attendance marked for %s", name)
                    else:
                        logger.info("Attendance already marked today for %s", name)

            # Draw bounding box and label
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.rectangle(
                frame, (left, bottom - 20), (right, bottom), color, cv2.FILLED
            )
            cv2.putText(
                frame,
                name,
                (left + 2, bottom - 5),
                cv2.FONT_HERSHEY_DUPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

        cv2.imshow("Face Recognition Attendance", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    video_capture.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_webcam_loop()

