# Comprehensive System Architecture

This document provides detailed architecture diagrams for the AI-Powered Recruitment Tool, generated using Mermaid.js.

## 1. System Context Diagram (High Level)

This diagram portrays the system's interaction with external users and services.

```mermaid
graph TD
    %% Actors
    Candidate[Candidate]
    Recruiter[Recruiter]

    %% Main System
    subgraph "AI-Powered Recruitment Tool"
        WebClient[Frontend Web App (React/Vite)]
        APIServer[Backend API (Node.js/Express)]
        Database[(MongoDB)]
    end

    %% External Services
    Groq[Groq Cloud API<br/>(Llama-3.3-70b)]
    Gemini[Google Gemini API<br/>(Generative AI)]
    Email[SMTP Server<br/>(Nodemailer)]

    %% Relationships
    Candidate -->|Uses| WebClient
    Recruiter -->|Uses| WebClient
    WebClient <-->|HTTPS/JSON| APIServer
    APIServer <-->|Mongoose ODM| Database
    APIServer <-->|Inference Request| Groq
    APIServer <-->|GenAI Request| Gemini
    APIServer -->|Send Emails| Email
```

## 2. Container Architecture

Detailed view of the internal code structure and major libraries.

```mermaid
graph TB
    subgraph "Frontend (client)"
        direction TB
        UI_Components[React Components]
        State[Context/Redux Store]
        Router[React Router]
        Axios[Axios HTTP Client]
        
        UI_Components --> State
        UI_Components --> Router
        State --> Axios
    end

    subgraph "Backend (backend)"
        direction TB
        Express[Express App]
        RouterMiddleware[Routes & Middleware]
        Controllers[Contollers]
        Services[Business Logic Services]
        Models[Mongoose Models]
        
        Express --> RouterMiddleware
        RouterMiddleware --> Controllers
        Controllers --> Services
        Services --> Models
    end
    
    Axios <-->|API Calls| Express
```

## 3. Database Schema (ER Diagram)

Conceptual representation of the MongoDB collections.

```mermaid
erDiagram
    Users {
        ObjectId _id
        String name
        String email
        String password
        String role "recruiter|candidate"
    }
    
    Jobs {
        ObjectId _id
        String title
        String description
        String requirements
        ObjectId recruiterId
    }
    
    Applications {
        ObjectId _id
        ObjectId candidateId
        ObjectId jobId
        String status
        Float matchScore
    }
    
    Interviews {
        ObjectId _id
        ObjectId applicationId
        Date scheduledAt
        Array questions
        String transcription
        String feedback
    }

    Users ||--o{ Jobs : "posts (if recruiter)"
    Users ||--o{ Applications : "submits (if candidate)"
    Jobs ||--o{ Applications : "receives"
    Applications ||--o{ Interviews : "has"
```

## 4. Feature Workflows

### AI Resume Matching Logic
This flow explains how the Resume Parsing and Matching engine works.

```mermaid
sequenceDiagram
    participant User as Candidate
    participant FE as Frontend
    participant BE as Backend
    participant Parser as PDF/Text Parser
    participant AI as Groq/Gemini API
    participant DB as MongoDB

    User->>FE: Upload Resume (PDF/Doc)
    FE->>BE: POST /api/resume/analyze
    BE->>Parser: Extract Text from File
    Parser-->>BE: Raw Text
    BE->>DB: Fetch Job Description (if applying)
    DB-->>BE: Job Requirements
    BE->>AI: Prompt: "Compare Resume vs Job..."
    AI-->>BE: JSON Response { matchScore, keywords, missingSkills }
    BE->>DB: Save Application & Score
    BE-->>FE: Return Analysis Result
    FE-->>User: Show Match Score & Suggestions
```

### AI Interview Assistant Flow
The flow for the interactive interview session.

```mermaid
sequenceDiagram
    participant ID as Interview Page
    participant BE as Backend
    participant AI as AI Service
    
    ID->>BE: Request Interview Questions (Job Context)
    BE->>AI: Generate Technical Questions
    AI-->>BE: List of Questions
    BE-->>ID: Return Questions
    
    loop For Each Question
        ID->>ID: User Records Answer (Speech-to-Text)
        ID->>BE: Submit Answer Text
        BE->>AI: Evaluate Answer (Correctness/Sentiment)
        AI-->>BE: Feedback & Rating
        BE-->>ID: Return Real-time Feedback
    end
```
