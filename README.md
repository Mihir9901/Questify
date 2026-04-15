# Questify: Adaptive Learning & Assessment Platform

## Overview
Questify is a modern, AI-powered educational platform that automates the generation of quizzes from study materials (PDFs/Text). Built on the MERN stack and integrated with the Groq API (Llama 3), it dramatically reduces manual workload for educators while providing students with an interactive, adaptive learning environment driven by deep text analysis.

## Core Features
1. **Teacher Dashboard**:
   - Upload PDF materials processed via memory using `pdf-parse`.
   - Leverage Groq LLM (via strict Zod JSON parsing) to dynamically generate adaptive quizzes based on uploaded concept materials.
   - Assign quizzes at Easy, Medium, or Hard difficulty to the class.
   - Analyze class performance and student attempts through Recharts.

2. **Student Dashboard**:
   - View pending and completed quiz assignments.
   - Interactive timed Attempt Quiz interface.
   - Get immediate AI-powered feedback on performance and accuracy tracking trends over time.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS (Premium Glassmorphism UI), Zustand (State Management), React Router, Recharts.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose Schema).
- **Core AI & Services**: Groq SDK for Generative AI, Multer for file processing in memory, pdf-parse for text extraction, Zod for JSON output validation from LLM, bcryptjs + jsonwebtoken for secure Auth.

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Local or MongoDB Atlas)
- Groq API Key

### Backend Setup
1. Open terminal and navigate into the `backend/` directory.
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create and configure your `.env` file (A template is prepared):
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_random_secret_here
   GROQ_API_KEY=your_groq_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. In a new terminal, navigate into the `frontend/` directory.
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

The frontend will be exposed at `http://localhost:5173` while proxying API requests automatically to `http://localhost:5000/api`.

---
*Built with modern architecture and premium design principles.*
