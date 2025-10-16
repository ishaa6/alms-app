# ALMS (Attendance and Leave Management System) 📚

ALMS is a mobile-first system to manage attendance and leave for employees. It provides an interface for marking attendance, applying for leave, and viewing dashboards, while the backend handles authentication, data storage, and approvals.

This project uses **React Native (Expo) for the frontend** and a **Node.js/Express backend**.

---

## Project Structure

```
alms-app/
├── frontend/        # React Native Expo app
│   ├── app/         # Screens and navigation
│   ├── components/  # Reusable UI components
│   ├── assets/      # Images, fonts, icons
│   ├── hooks/       # Custom React hooks
│   ├── constants/   # Config, styles, theme
│   ├── babel.config.js
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/         # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Tech Stack

* **Frontend:** React Native, Expo, NativeWind (Tailwind CSS), Expo Router
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT
* **API Communication:** RESTful APIs
* **Version Control:** Git & GitHub

---

## Future Enhancements

* Biometric attendance (face/fingerprint)
* Push notifications for leave approvals
* Attendance analytics dashboard
* Calendar integrations

