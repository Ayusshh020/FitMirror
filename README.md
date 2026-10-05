# FitMirror — Virtual Fitting Room

A full-stack MERN application built as a college academic project for the Backend Development case study. FitMirror provides a REST API backend and React frontend for a virtual fitting room platform where users can browse garments, enter body measurements, receive size recommendations, upload a full-body photo, try on outfits virtually, and save and share their looks. Retailers can manage their garment catalog and track conversion analytics.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Key Features](#4-key-features)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture / Project Flow](#6-system-architecture--project-flow)
7. [Project Structure](#7-project-structure)
8. [API Documentation](#8-api-documentation)
9. [Authentication](#9-authentication)
10. [Image Upload Implementation](#10-image-upload-implementation)
11. [Setup Instructions](#11-setup-instructions)
12. [Environment Variables](#12-environment-variables)
13. [API Testing](#13-api-testing)
14. [User Flow](#14-user-flow)
15. [Retailer Flow](#15-retailer-flow)
16. [Security](#16-security)
17. [Limitations / Implementation Notes](#17-limitations--implementation-notes)
18. [Future Enhancements](#18-future-enhancements)
19. [Testing / Verification](#19-testing--verification)
20. [Academic Project](#20-academic-project)
21. [License](#21-license)

---

## 1. Project Overview

FitMirror is a virtual fitting room platform built to address the challenge of size visualization in online fashion retail. Users can browse a garment catalog, enter their body measurements, receive automated size recommendations, upload a full-body photo, try garments on virtually using a canvas-based overlay, and save and share their outfit combinations.

Retailers have a separate dashboard to manage their garment listings, view analytics on try-on and purchase-click conversions, and send real-time notifications to users via Socket.io.

The backend is a RESTful API built with Node.js and Express.js, backed by MongoDB. Authentication is handled through both JWT and Firebase Email/Password Authentication. API documentation is available through Swagger UI and a Postman collection.

---

## 2. Problem Statement

**Case Study 55 — Backend Development: Virtual Fitting Room**

Online fashion retail suffers from high return rates caused by customers being unable to visualize how clothes will fit them before purchasing. This project addresses that by building a backend system that supports:

- User registration, authentication, and role management (user and retailer roles)
- Garment catalog management for retailers
- User body measurements and automated size recommendations
- Virtual try-on by overlaying garment images onto user photos
- Saving and sharing outfit combinations (saved looks)
- Retailer conversion analytics (try-on events and purchase clicks)
- Real-time in-app notifications using Socket.io
- API documentation via Swagger/OpenAPI and Postman

---

## 3. Objectives

- Build a modular, maintainable Node.js and Express.js REST API
- Implement JWT-based authentication with role-based authorization
- Integrate Firebase Authentication (Email/Password) as an additional authentication layer
- Store and manage garment data and user body measurements in MongoDB
- Implement rule-based size and garment recommendations from user measurements
- Enable users to upload full-body photos and save outfit looks
- Allow retailers to manage garments and view conversion analytics
- Deliver real-time notifications using Socket.io
- Provide complete API documentation via Swagger UI and a Postman collection

---

## 4. Key Features

### User Features
- Register and log in with email and password
- Firebase Email/Password Authentication
- Browse garment catalog with search, category, and size filters
- Enter and update body measurements
- Receive automated size recommendations based on measurements
- Browse recommended garments matched to their size
- Upload a full-body photo
- Try on garments using a canvas-based overlay in the browser
- Save outfit combinations (saved looks)
- Share saved looks via unique public links

### Retailer Features
- Retailer login and protected dashboard
- Add, edit, and delete garments (with image upload)
- View conversion analytics per garment (try-on count, purchase-click count, conversion rate)
- Send real-time notifications to users via Socket.io

### Backend / API Features
- RESTful API with consistent JSON response format
- Modular routes, controllers, and services
- Input validation using express-validator
- Centralized error handling middleware
- Invalid MongoDB ObjectId handling (auto-converts to 404)
- Pagination on garment listing
- Seeder script for initial data

### Authentication and Security
- JWT authentication for all protected routes
- Firebase Admin SDK for verifying Firebase ID tokens
- Firebase ID token exchange for FitMirror JWT
- Role-based authorization (user / retailer)
- Request body validation middleware
- Retailer ownership checks on garment operations

### Recommendations
- Rule-based size recommendation computed from chest, waist, hips, shoulder, and preferred fit
- Garment recommendations filtered by user's recommended size and category

### Analytics and Notifications
- Try-on and purchase-click event tracking per garment
- Retailer conversion analytics with per-garment and overall rates
- Real-time notifications via Socket.io (store and emit)
- In-app notification read state management

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js |
| Backend framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Frontend framework | React 19 |
| Frontend build tool | Vite |
| Authentication | JWT + Firebase Authentication |
| Real-time | Socket.io |
| File upload | Multer (local storage) |
| API docs | Swagger / OpenAPI 3.0 |
| API testing | Postman |
| Validation | express-validator |
| HTTP client | Axios |
| Frontend routing | React Router DOM |

---

## 6. System Architecture / Project Flow

### Request Flow

```
Browser (React Frontend)
        |
        | HTTP / Axios
        v
Express REST API  (/api/*)
        |
        v
Middleware Layer
  - CORS
  - JSON body parsing
  - JWT authentication (protect)
  - Role authorization (authorize)
  - File upload (Multer)
  - Request validation (express-validator)
        |
        v
Controllers
  - auth.controller.js
  - garment.controller.js
  - measurement.controller.js
  - recommendation.controller.js
  - savedLook.controller.js
  - analytics.controller.js
  - notification.controller.js
  - userUpload.controller.js
        |
        v
Services / Models
  - recommendation.service.js
  - notification.service.js
  - storage.service.js
  - Mongoose Models (User, Garment, Measurement, SavedLook, TryOnEvent, Notification)
        |
        v
MongoDB (fitmirror database)
```

### Authentication Flow

```
User: Firebase Email/Password Sign-In
        |
        | Firebase Client SDK
        v
Firebase ID Token (client-side)
        |
        | POST /api/auth/firebase  { idToken }
        v
Backend: Firebase Admin SDK verifies token
        |
        v
User looked up / created in MongoDB
        |
        v
FitMirror JWT generated and returned
        |
        v
Frontend stores JWT → used in Authorization header
        |
        v
Protected API endpoints
```

Standard JWT login is also available directly via `POST /api/auth/login`.

### Real-time Notifications

```
Retailer → POST /api/notifications/send
        |
        v
Notification stored in MongoDB
        |
        v
Socket.io emits event to recipient's room
        |
        v
User's browser receives live notification
```

---

## 7. Project Structure

```
FitMirror/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── uploads/               # Local image storage (gitignored)
│   └── src/
│       ├── app.js             # Express app setup, Swagger UI mount
│       ├── server.js          # HTTP server + Socket.io init
│       ├── seed.js            # Database seeder
│       ├── config/
│       │   ├── db.js          # MongoDB connection
│       │   ├── env.js         # Environment variable loader
│       │   ├── firebase.js    # Firebase Admin SDK initialization
│       │   ├── socket.js      # Socket.io configuration
│       │   └── swagger.js     # OpenAPI 3.0 specification
│       ├── controllers/       # Route handler logic
│       ├── middleware/
│       │   ├── auth.middleware.js     # JWT verification
│       │   ├── role.middleware.js     # Role-based authorization
│       │   ├── upload.middleware.js   # Multer file upload
│       │   ├── validate.middleware.js # express-validator error handling
│       │   └── error.middleware.js    # Centralized error handler
│       ├── models/            # Mongoose schemas
│       │   ├── User.js
│       │   ├── Garment.js
│       │   ├── Measurement.js
│       │   ├── SavedLook.js
│       │   ├── TryOnEvent.js
│       │   └── Notification.js
│       ├── routes/            # Express routers
│       ├── services/
│       │   ├── recommendation.service.js
│       │   ├── notification.service.js
│       │   └── storage.service.js
│       ├── utils/
│       │   ├── ApiError.js
│       │   ├── ApiResponse.js
│       │   └── asyncHandler.js
│       └── validators/        # express-validator rule sets
│
├── frontend/
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/               # Axios instance and API call functions
│       ├── components/        # Navbar, GarmentCard, ProtectedRoute, WebcamCapture
│       ├── config/
│       │   └── firebase.js    # Firebase client SDK configuration
│       ├── context/
│       │   └── AuthContext.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Garments.jsx
│           ├── GarmentDetail.jsx
│           ├── Measurements.jsx
│           ├── Recommendations.jsx
│           ├── SavedLooks.jsx
│           ├── SharedLook.jsx
│           └── RetailerDashboard.jsx
│
└── docs/
    └── FitMirror-API.postman_collection.json
```

---

## 8. API Documentation

### Swagger UI

Start the backend server and open in a browser:

```
http://localhost:5001/api-docs
```

The Swagger UI provides interactive documentation for all endpoints. Use the **Authorize** button to enter your Bearer JWT token so protected endpoints can be tested directly in the browser.

### Postman Collection

A complete Postman v2.1 collection is included:

```
docs/FitMirror-API.postman_collection.json
```

Import this file into Postman. Collection variables (`baseUrl`, `token`, `garmentId`, `savedLookId`, `notificationId`) are pre-configured. The Login request automatically saves the JWT token to `{{token}}`.

### API Groups and Endpoints

| Group | Base Path | Key Endpoints |
|---|---|---|
| Authentication | `/api/auth` | POST /register, POST /login, POST /firebase, GET /me |
| Garments | `/api/garments` | GET / (public), GET /:id, POST /, PUT /:id, DELETE /:id |
| Measurements | `/api/measurements` | GET /, PUT / |
| Recommendations | `/api/recommendations` | GET /, GET /size |
| Saved Looks | `/api/saved-looks` | POST /, GET /, GET /:id, DELETE /:id |
| Analytics | `/api/analytics` | POST /track, GET /conversions |
| Notifications | `/api/notifications` | GET /, POST /send, PUT /:id/read |
| User | `/api/user` | POST /upload |

All responses follow the format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Description of result",
  "data": { ... }
}
```

---

## 9. Authentication

### Registration

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "yourpassword"
}
```

All public registrations are assigned `role: "user"`. There is no public retailer registration.

### Standard Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "yourpassword"
}
```

Returns a JWT token. Use it in subsequent requests:

```
Authorization: Bearer <token>
```

### Firebase Authentication

```
POST /api/auth/firebase
Content-Type: application/json

{
  "idToken": "<firebase-id-token-from-client-sdk>"
}
```

The frontend signs the user in with Firebase Email/Password, obtains a Firebase ID token, and sends it to this endpoint. The backend verifies it with Firebase Admin SDK and returns a FitMirror JWT.

### Protected Routes

All protected routes require:

```
Authorization: Bearer <jwt-token>
```

### Role-based Authorization

Retailer-only endpoints (garment write operations, conversion analytics, send notification) additionally require the user to have `role: "retailer"`. This role is assigned through the database seeder or direct database setup.

---

## 10. Image Upload Implementation

All image uploads in FitMirror use **Multer** for local file storage. Uploaded files are saved to the `backend/uploads/` directory and served as static files by Express.

**Garment images** are uploaded by retailers when creating or updating garments using `multipart/form-data` with field name `image`.

**User full-body photos** are uploaded by users using `multipart/form-data` with field name `photo`. The file path is stored in the user's `photoUrl` field in MongoDB.

Image URLs returned by the API are local paths such as `/uploads/garments/filename.jpg`. The frontend resolves these to the full backend server URL before displaying them.

**Note on Firebase Cloud Storage:** The original problem statement referenced Firebase Cloud Storage for image storage. In this academic implementation, Firebase Cloud Storage was not used because it requires a paid Blaze billing plan. Local Multer storage provides equivalent functionality for the academic scope of this project. Firebase Authentication (Email/Password) is fully implemented and working.

---

## 11. Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- MongoDB (local installation or MongoDB Atlas)
- A Firebase project with Email/Password Authentication enabled (optional — the app falls back gracefully if Firebase is not configured)

### Clone the Repository

```bash
git clone https://github.com/Ayusshh020/FitMirror.git
cd FitMirror
```

### Backend Setup

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Edit `backend/.env` with your values (see [Environment Variables](#12-environment-variables)).

Create the uploads directory if it does not exist:

```bash
mkdir -p uploads/garments uploads/users
```

Start the backend development server:

```bash
npm run dev
```

The backend runs on **http://localhost:5001**.

To seed the database with sample garments and a retailer account:

```bash
npm run seed
```

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Edit `frontend/.env` with your Firebase project configuration (see [Environment Variables](#12-environment-variables)).

Start the frontend development server:

```bash
npm run dev
```

The frontend runs on **http://localhost:5173**.

---

## 12. Environment Variables

### Backend — `backend/.env`

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fitmirror
JWT_SECRET=your_strong_random_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Firebase Admin SDK (optional — for Firebase Authentication)
# Paste the full contents of your Firebase service account JSON here as a single-line string
FIREBASE_SERVICE_ACCOUNT_JSON=
```

To obtain `FIREBASE_SERVICE_ACCOUNT_JSON`: Go to Firebase Console → Project Settings → Service Accounts → Generate New Private Key. Paste the entire JSON as the value of this variable.

If this variable is left empty, Firebase Authentication is disabled but all other functionality continues to work normally.

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

These values are found in the Firebase Console under Project Settings → Your Apps → Firebase SDK snippet.

**Never commit actual `.env` files.** Both `.env` files are excluded via `.gitignore`.

---

## 13. API Testing

### Using Swagger UI

1. Start the backend server (`npm run dev` in the `backend/` directory).
2. Open `http://localhost:5001/api-docs` in a browser.
3. Use `POST /api/auth/login` to obtain a token.
4. Click the **Authorize** button at the top of the page.
5. Enter `Bearer <your-token>` and click Authorize.
6. Test any endpoint directly from the browser.

### Using Postman

1. Open Postman.
2. Import `docs/FitMirror-API.postman_collection.json`.
3. Run the **Login** request — the test script automatically saves the token to `{{token}}`.
4. All other requests are pre-configured to use `{{token}}` for authentication.

---

## 14. User Flow

```
Register / Login
    │
    ▼
Authentication (JWT or Firebase → JWT)
    │
    ▼
Browse Garment Catalog
  (search by name, filter by category and size)
    │
    ▼
Enter Body Measurements
  (height, weight, chest, waist, hips, preferred fit)
    │
    ▼
Receive Size Recommendation (S / M / L / XL)
    │
    ▼
Browse Recommended Garments
  (filtered to user's size and preferred categories)
    │
    ▼
Open Garment Detail
    │
    ▼
Upload Full-Body Photo (or use webcam)
    │
    ▼
Virtual Try-On (garment overlaid on photo using canvas)
    │
    ▼
Save Look (name the outfit, mark public or private)
    │
    ▼
Share Look (copy public share link)
    │
    ▼
Analytics Events Tracked
  (try_on and purchase_click events sent to backend)
```

---

## 15. Retailer Flow

```
Retailer Login
    │
    ▼
Retailer Dashboard (protected, role: retailer)
    │
    ├── My Garments tab
    │     │
    │     ├── Add New Garment
    │     │   (title, category, price, sizes, image upload)
    │     ├── Edit Garment
    │     └── Delete Garment
    │
    ├── Conversion Analytics tab
    │     │
    │     ├── Total try-ons
    │     ├── Total purchase clicks
    │     ├── Overall conversion rate
    │     └── Per-garment breakdown
    │
    └── Notifications tab
          │
          └── Send real-time notification to a user
                (stored in DB + emitted via Socket.io)
```

---

## 16. Security

- **JWT authentication:** All protected routes validate a signed JWT token on every request.
- **Firebase token verification:** Firebase ID tokens are verified server-side using Firebase Admin SDK before a FitMirror JWT is issued.
- **Role-based authorization:** Retailer-only endpoints are protected by a separate role middleware. A user account cannot access retailer routes.
- **Retailer ownership checks:** Garment update and delete operations verify that the requesting retailer owns the garment.
- **Request validation:** All write endpoints use express-validator rule sets to validate and sanitize input.
- **Centralized error handling:** Errors are caught by a single middleware and returned in a consistent format without exposing stack traces or internal details.
- **Environment variables:** All secrets (JWT secret, MongoDB URI, Firebase credentials) are stored in `.env` files, which are excluded from version control via `.gitignore`.
- **CORS:** The backend only accepts requests from the configured client origin.

---

## 17. Limitations / Implementation Notes

The following points distinguish implemented features from optional or deferred ones:

| Item | Status |
|---|---|
| JWT Authentication | Implemented |
| Firebase Email/Password Authentication | Implemented |
| Garment CRUD (retailer) | Implemented |
| Body measurements and size recommendation | Implemented (rule-based) |
| Garment recommendations | Implemented (rule-based, size-matched) |
| Saved looks and share links | Implemented |
| Conversion analytics | Implemented |
| Real-time notifications (Socket.io) | Implemented |
| Full-body photo upload and virtual try-on | Implemented (canvas overlay) |
| Firebase Cloud Storage | Not used — local Multer storage used instead (see Section 10) |
| Body measurement extraction from photo | Not implemented — this was listed as an optional advanced feature in the problem statement |
| ML/AI-based recommendations | Not implemented — rule-based logic is used |
| Deployment | Not included in this submission |

---

## 18. Future Enhancements

The following are potential enhancements identified in the problem statement but not implemented in this academic submission:

- **Body measurement from photo:** Use computer vision to extract measurements automatically from an uploaded photo, removing the need for manual entry.
- **AI/ML style recommendations:** Replace the rule-based recommendation engine with a model trained on purchase and preference data.
- **Advanced virtual dressing room:** Use augmented reality or more sophisticated image processing for realistic garment try-on.
- **Cloud image storage:** Migrate from local Multer storage to Firebase Cloud Storage or another object storage service for scalable production use.
- **Deployment:** Deploy the backend API and frontend to a cloud platform (e.g., Railway, Render, Vercel).
- **Automated testing:** Add unit tests for services and integration tests for API endpoints.

---

## 19. Testing / Verification

The following testing was performed manually during development:

**API testing via Postman:**
- `POST /api/auth/register` and `POST /api/auth/login` — verified token generation
- `GET /api/auth/me` — verified authenticated user profile
- `GET /api/garments` — verified listing with filters
- `GET /api/garments/:id` — verified single garment fetch
- `GET /api/measurements` and `PUT /api/measurements` — verified measurement save and size recommendation
- `GET /api/recommendations` and `GET /api/recommendations/size` — verified rule-based recommendations

**Frontend flow testing:**
- User registration, login, and Firebase Authentication
- Garment browsing with search and filters
- Measurement entry and size recommendation display
- Full-body photo upload
- Canvas-based virtual try-on
- Saved look creation and share link generation
- Retailer dashboard: garment CRUD, analytics, notification dispatch

No automated test suite is included in this submission.

---

## 20. Academic Project

| | |
|---|---|
| **Course** | Backend Development — Node.js, Express.js and MongoDB |
| **Case Study** | 55 — Backend Development: Virtual Fitting Room |
| **Institution** | ITM Skills University |
| **Project** | FitMirror — Virtual Fitting Room |

---

## 21. License

This project was developed as an academic submission for ITM Skills University. It is intended for educational purposes. No open-source license is applied.
