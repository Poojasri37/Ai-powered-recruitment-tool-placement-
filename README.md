# AI-Powered Recruitment Tool

A full-stack advanced recruitment platform leveraging AI for resume parsing, candidate matching, and automated interviewing. Built with React (Vite), Node.js, Express, MongoDB, and Groq AI.

## 🌟 Key Features

### For Recruiters
*   **Smart Dashboard**: Analytics on applications, interview stats, and recent activity.
*   **AI Job Matching**: Automatically matches candidates to jobs based on resume analysis with a % score.
*   **Kanban Application Board**: Drag-and-drop workflow (Applied → Reviewing → Interview → Hired).
*   **Resume Parsing**: Support for PDF/DOCX with automated skill extraction.
*   **Comparison Tool**: Side-by-side comparison of shortlisted candidates.
*   **Interview Scheduling**: Integrated calendar and email notifications for scheduled interviews.

### For Candidate
*   **Experience Dashboard**: Visual timeline of application status, upcoming interview countdowns, and notifications.
*   **Resume Preview & Edit**: Upload resumes and manually refine detected skills for better matching.
*   **AI Interviewer**:
    *   **Live Webcam Interview**: Real-time video interview with an AI avatar.
    *   **Voice & Code**: Supports speech-to-text answers and a live code editor for technical questions.
    *   **Instant Feedback**: Post-interview performance review with scores and radar charts.
    *   **Smart Matching**: "Match Breakdown" showing missing vs. matched skills for every job.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 18 + Vite + TypeScript
*   **Styling**: TailwindCSS (Modern, Responsive, Animated)
*   **Charts**: Recharts
*   **State/Drag**: `@dnd-kit/core` (Kanban), LocalStorage (Persistence)
*   **Editor**: Monaco Editor (for coding interviews)

### Backend
*   **Runtime**: Node.js + Express
*   **Database**: MongoDB + Mongoose
*   **AI Models**: Groq (for parsing, matching, and interview logic)
*   **Docs Processing**: `pdf-parse`, `mammoth` (DOCX)
*   **Auth**: JWT-based authentication

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)
*   Groq 

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd recruitment-tool
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file
    cp .env.example .env 
    # Update .env with your MONGO_URI and GROQ_API_KEY
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Access the App**
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:5000`

---

## 📸 Screen Previews

*   **Recruiter Dashboard**: Analytics charts, Activity Feed, and Talent Matcher sidebar.
*   **Candidate Board**: Kanban style drag-and-drop for managing applicants.
*   **Interview Room**: Split screen with AI Avatar, Code Editor, and Live Video Feed.

## 📄 License
ISC
