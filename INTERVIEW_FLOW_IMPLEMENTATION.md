# Interview Flow - Complete Implementation ✅

## Overview
The interview system now follows the correct architecture where:
- **HR/Recruiter** schedules interviews
- **Candidate** attends AI-powered interviews
- **System** evaluates responses and provides scores
- **HR** reviews results

---

## Candidate Flow

### 1. Candidate Dashboard
**Route**: `/candidate-dashboard`
**Shows**:
- All job applications
- Application status (applied, reviewing, interview_scheduled, rejected, accepted)
- Match score for each application
- **Interview Scheduled Section** (when interview is scheduled):
  - Interview date and time
  - **"Start Interview" button** that routes to `/interview/:sessionId`

**Backend**: `GET /api/candidate-jobs/candidate/applications/list`
- Returns all applications for the current candidate
- Includes interview details if scheduled

---

### 2. Interview Page
**Route**: `/interview/:sessionId`
**Features**:
- ✅ Loads interview session data from backend
- ✅ Fetches 4 AI-generated questions (behavioral, technical, coding)
- ✅ Captures candidate answers (text for behavioral/technical, code editor for coding)
- ✅ **Prevents copy-paste** at document level and on textarea
- ✅ Records camera/microphone (with permissions)
- ✅ Tracks interview duration
- ✅ Displays guidance for each question type

**Question Types**:
1. Behavioral - 2 questions (personality, teamwork, problem-solving)
2. Technical - 1 question (job-specific skills)
3. Coding - 1 question (programming challenge)

**Copy-Paste Prevention**:
- Blocked at document level when interview starts
- Blocked on textarea via onCopy/onPaste handlers
- Error message shown: "Copy-paste is disabled during the interview"

**Submission**:
- Candidate submits all 4 answers
- POST to `/api/interviews/:sessionId/submit` with:
  - score (calculated as % of questions answered)
  - responses (array of questions and answers)
  - codeSubmissions (for coding question)
  - transcript (full Q&A)
  - duration (seconds)

**Backend Processing**:
- AI evaluates each response using Gemini API
- Generates evaluation summary
- Saves results to InterviewSession model
- Updates Application with score and summary

---

### 3. Interview Complete Page
**Route**: `/candidate-interviews-complete` (after submission)
**Shows**:
- ✅ Success message
- ✅ Interview score (0-100%)
- ✅ Confirmation messages
- Button to return to dashboard

---

## HR/Recruiter Flow

### 1. Schedule Interview
**Location**: ApplicationDetailPage at `/application/:appId`
**When**: When application status is `'applied'`
**Form**:
- Date/Time picker (must be future date)
- Creates interview session
- Updates application status to `'interview_scheduled'`
- Generates session link (`/interview/:sessionId`)
- Sends email to candidate with details

**Backend**: `POST /api/interviews/schedule`
- Creates InterviewSession document
- Updates Application with:
  - interviewDate
  - sessionLink
  - interviewSessionId
  - status = 'interview_scheduled'

---

### 2. View Interview Results
**Location**: ApplicationDetailPage at `/application/:appId`
**When**: After candidate completes interview
**Shows**:
- ✅ Interview status badge ("Interview Completed")
- ✅ Interview score (0-100%)
- ✅ AI evaluation summary
- ✅ Full details available (responses, evaluations, transcript, code)

**Application Status Flow**:
```
applied 
  ↓ (recruiter schedules)
interview_scheduled 
  ↓ (candidate completes)
accepted/rejected (recruiter decides)
```

---

## Data Models

### InterviewSession
```
{
  _id: ObjectId
  applicationId: Application ref
  candidateId: User ref
  jobId: Job ref
  resumeId: Resume ref
  scheduledTime: Date
  sessionLink: String (e.g., "/interview/uuid")
  status: 'scheduled' | 'in_progress' | 'completed'
  interviewResults: {
    score: Number (0-100)
    summary: String (AI generated)
    responses: Array[{question, answer, type, aiEvaluation}]
    codeSubmissions: Array[{language, code, output}]
    transcript: String
    duration: Number (seconds)
  }
}
```

### Application Updates
```
{
  interviewDate: Date
  sessionLink: String
  interviewSessionId: InterviewSession ref
  interviewResults: {
    score: Number
    summary: String
    timestamp: Date
  }
  status: 'applied' | 'interview_scheduled' | 'accepted' | 'rejected'
}
```

---

## API Endpoints

### Candidate Endpoints
- `GET /api/candidate-jobs/candidate/applications/list` - Get all applications
- `POST /api/interviews/schedule` - Schedule interview (called by recruiter)
- `GET /api/interviews/:sessionId` - Fetch interview session data
- `PUT /api/interviews/:sessionId/start` - Mark interview as in_progress
- `PUT /api/interviews/:sessionId/submit` - Submit interview results

### Recruiter Endpoints
- `GET /api/applications/job/:jobId` - View all applications for a job
- `GET /api/applications/detail/:appId` - View single application with results
- `POST /api/interviews/schedule` - Schedule interview for candidate

---

## Security Features

✅ **Copy-Paste Disabled**: Prevents unfair advantages
✅ **Camera/Mic Access**: Ensures proctoring
✅ **Duration Tracking**: Records how long interview took
✅ **Role-Based Access**: Only candidates can start their interviews, only recruiters can schedule
✅ **Session Validation**: Verifies candidate owns the interview session

---

## AI Integration

**Gemini API Used For**:
1. Generate 4 interview questions based on job details
2. Evaluate each response quality
3. Generate overall interview summary
4. Score calculation

---

## Testing Checklist

- [ ] Candidate can view scheduled interviews in dashboard
- [ ] Candidate can click "Start Interview" and access interview page
- [ ] Interview questions load correctly (4 total)
- [ ] Copy-paste is blocked during interview
- [ ] Candidate can submit answers
- [ ] Interview complete page shows score
- [ ] Recruiter can view interview results in application details
- [ ] Score and summary display correctly
- [ ] Status badge shows "Interview Completed"

---

## Next Steps (if needed)

- [ ] Add email notifications when interview scheduled
- [ ] Add calendar integration (Google Calendar)
- [ ] Add video recording option
- [ ] Add detailed evaluation report export
- [ ] Add candidate feedback after interview
- [ ] Add re-interview functionality

