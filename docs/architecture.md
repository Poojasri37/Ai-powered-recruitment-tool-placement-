# System Architecture

## Overview
The **AI-Powered Recruitment Tool** is a full-stack web application designed to streamline the hiring process using Artificial Intelligence. It features a modern React frontend and a Node.js/Express backend.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **AI Integration**: Groq API (Llama-3.3-70b for fast inference)

## Data Flow Diagrams

### 1. High-Level Architecture
```mermaid
graph TD
    User[User (Recruiter/Candidate)] -->|HTTPS| Frontend[React Client]
    Frontend -->|REST API| Backend[Node.js / Express Server]
    Backend -->|Queries| DB[(MongoDB Database)]
    Backend -->|Prompt/Response| AI[Groq API (Llama 3)]
    
    subgraph "Backend Services"
        Auth[Auth Service]
        Job[Job Service]
        App[Application Service]
        Match[Talent Matcher]
    end
    
    Backend --> Auth
    Backend --> Job
    Backend --> App
    Backend --> Match
```

### 2. Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant D as Database

    U->>C: Enter Credentials
    C->>S: POST /api/auth/login
    S->>D: Find User
    D-->>S: User Record
    S->>S: Verify Password (Bcrypt)
    S-->>C: JWT Token + User Info
    C->>C: Store Token in LocalStorage
    C-->>U: Redirect to Dashboard
```

### 3. AI Talent Matching Flow
```mermaid
sequenceDiagram
    participant R as Recruiter
    participant C as Client
    participant S as Server
    participant AI as Groq API

    R->>C: Upload Resume (PDF/DOCX)
    C->>S: POST /api/candidates/match-jobs (FormData)
    S->>S: Text Extraction (Multer/Textract)
    S->>S: Fetch Active Jobs from DB
    S->>AI: Send Resume Text + Job Descriptions
    AI-->>S: JSON Match Analysis & Scores
    S-->>C: Return Top Matches
    C-->>R: Display Match Cards
```

### 4. Application Status Workflow
```mermaid
stateDiagram-v2
    [*] --> Applied
    Applied --> Reviewing: Recruiter Views
    Reviewing --> Interview_Scheduled: Schedule Interview
    Reviewing --> Rejected: Manual Rejection
    Interview_Scheduled --> Accepted: Hire Candidate
    Interview_Scheduled --> Rejected: Don't Hire
    Accepted --> [*]
    Rejected --> [*]
```
