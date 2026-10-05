## Face Recognition Attendance System

This project is a **real-time face recognition & attendance management system** using:

- **Backend**: Python, Flask, SQLite, OpenCV, `face_recognition`
- **Frontend**: React (Vite), Tailwind CSS, MediaDevices webcam API

### Backend Setup

1. Install Python 3.10+ and make sure `pip` is available.
2. In a terminal, go to the `backend` folder:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   > Note: `face-recognition` and `dlib` may require C++ build tools. Install Visual Studio Build Tools on Windows if needed.

3. Run the Flask backend:

   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000`.

4. (Optional) To run the native webcam loop:

   ```bash
   python camera.py
   ```

### Frontend Setup

1. Install Node.js (18+ recommended).
2. In another terminal, go to the `frontend` folder:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open the URL printed by Vite (typically `http://localhost:5173`) in your browser.

### Usage Flow

1. **Login** with default admin credentials:
   - Username: `admin`
   - Password: `admin123`

2. **Register Student**
   - Go to "Register Student" page.
   - Fill `Student ID`, `Name`, `Department`.
   - Capture **5–10** clear face images using the webcam.
   - Submit the form. Encodings are computed and stored in SQLite.

3. **Live Attendance**
   - Go to "Live Attendance".
   - The webcam will auto-capture frames (~1 per second).
   - When a registered face is recognized:
     - Status badge shows **Recognized**.
     - Attendance is automatically marked once per day (duplicate prevention).

4. **Absence List**
   - Go to "Absence List" page.
   - Select any date using the date picker.
   - View all students who were **absent** on that date.
   - Search absent students by **Name** or **Student ID**.
   - Filter absent students by **Department**.
   - View **All Days Summary** table showing:
     - Present count per day
     - Absent count per day
     - Attendance rate % per day
   - Click **"View Absences"** button on any date to see absent students.
   - Click **Refresh** button to reload latest data.

5. **Admin Dashboard**
   - View total students, today’s attendance count, and tables for:
     - Registered students
     - Today’s attendance
     - All attendance history
