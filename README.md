# Email Sender Dashboard

A full-stack bulk email sender application with a modern React frontend and Node.js/Express backend. Easily manage email templates, upload recipient data, and send personalized campaigns.

You can find the Deployed Project here : [Live Demo](https://email-sender-vs94.vercel.app/)

---

## Features

- **Email Templates:**  
  - Create, edit, copy, delete, and use categorized templates (General, Business, Personal).
  - Variables support for dynamic content.
- **Data Management:**  
  - Upload CSV/Excel files with recipient data.
  - Preview, validate, and manage uploaded files.
- **Campaigns:**  
  - Draft and send personalized emails using templates and uploaded data.
  - Preview emails before sending.
- **Authentication:**  
  - User registration and login with JWT-based authentication.
- **Responsive UI:**  
  - Built with React, Tailwind CSS, and Lucide icons for a modern look.

---

## Project Structure

```
Email_Sender/
  backend/
    controllers/
    middleware/
    middlewares/
    models/
    routes/
    uploads/
    utils/
    .env
    package.json
    server.js
  frontend/
    public/
    src/
      Components/
        pages/
      index.css
    .env
    package.json
    tailwind.config.js
    vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup

1. **Install dependencies:**
    ```sh
    cd Email_Sender/backend
    npm install
    ```
2. **Configure environment:**
    - Copy `.env.example` to `.env` and set:
      ```
      MONGO_URI=your_mongodb_connection_string
      SECRET_KEY=your_jwt_secret
      ```
3. **Start the backend:**
    ```sh
    npm run dev
    ```
    The backend runs on `http://localhost:5001`.

### Frontend Setup

1. **Install dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```
2. **Configure environment:**
    - Edit `.env` if needed (default: `VITE_API_BASE_URL=http://localhost:5001/api`)
3. **Start the frontend:**
    ```sh
    npm run dev
    ```
    The frontend runs on `http://localhost:5173` (or as shown in terminal).

---

## Usage

- **Templates:**  
  Go to "Templates" to manage your email templates.
- **Data:**  
  Upload recipient lists in CSV/Excel format under "Data".
- **Draft:**  
  Use a template and data file to draft and send a campaign.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide-react, Axios
- **Backend:** Node.js, Express, Mongoose, JWT, Multer, PapaParse
- **Database:** MongoDB

---

## Scripts

### Backend

- `npm run dev` – Start backend with nodemon
- `npm start` – Start backend

### Frontend

- `npm run dev` – Start frontend dev server
- `npm run build` – Build frontend
- `npm run preview` – Preview production build

---
