# AI-Powered Recruitment Tool

A modern, full-stack application designed to streamline the hiring process using Artificial Intelligence. Key features include AI resume matching, automated interview scheduling, and a glassmorphic dashboard interface.

## 🚀 Features

-   **Role-Based Dashboards**: Distinct views for Recruiters (manage jobs/candidates) and Candidates (track applications/interviews).
-   **AI Talent Matcher**: Upload resumes to automatically find the best job matches using **Groq API**.
-   **Interview Assistant**: AI-powered generated questions and response evaluation.
-   **Interactive Dashboard**: Real-time stats, charts, and activity feeds.
-   **Dynamic Interview Mgmt**: Schedule interviews, provide feedback, and track history.
-   **Modern UI**: Built with Tailwind CSS, featuring glassmorphism and smooth animations.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Recharts
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **AI**: Groq API (Llama-3.3-70b)

## 📋 Setup & Installation

### Prerequisites
-   Node.js (v16+)
-   MongoDB (Local or Atlas URI)
-   Groq API Key

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/Poojasri37/AI-Powered-Recruitment-Tool.git
cd "AI powered Recruitment tool"
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
# Create a .env file based on .env.example
# Add your MONGO_URI, JWT_SECRET, and GROQ_API_KEY
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

## 🤖 AI Tools Used

This project leverages **Groq API** (powered by Llama 3 models) for high-speed intelligence features:
1.  **Resume Analysis**: Extracts key skills and experience from unstructured text.
2.  **Job Matching**: Semantically compares resume content against job descriptions.
3.  **Interview Assistant**: Generates contextual interview questions and evaluates candidate answers in real-time.

## ☁️ Deployment

### Frontend (Vercel/Netlify)
1.  Push the code to GitHub.
2.  Import the `client` folder into Vercel.
3.  Set the Build Command to `npm run build` and Output Directory to `dist`.
4.  Add environment variables (e.g., `VITE_API_URL` pointing to your deployed backend).

### Backend (Render/Heroku/Railway)
1.  Push the code to GitHub.
2.  Import the `backend` folder.
3.  Set the Start Command to `node index.js`.
4.  Add environment variables (`MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`).

## 🧪 Testing

Refer to `docs/test-report.md` for a detailed breakdown of the testing strategy and results.
See `docs/architecture.md` for system diagrams.

---
*Built with ❤️ for the Future of Hiring*
--POOJASRI M
