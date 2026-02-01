# 🔍 Data Flow Verification & Debugging Guide

## 📊 Complete Data Flow Diagram

```
STEP 1: REGISTRATION & LOGIN
┌─────────────────────────┐
│  Candidate/Recruiter    │
│   Registers & Logs In   │
└────────────┬────────────┘
             │
             ▼
       JWT Token Created
             │
             ▼
       Stored in localStorage
             │
             ▼
    Dashboard Loads (Role-based)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: RECRUITER CREATES JOB
┌──────────────────────────┐
│  Recruiter Fills Form    │
│ - Title, Description     │
│ - Required Skills        │
└────────────┬─────────────┘
             │
             ▼
      POST /api/jobs
      {title, description, skills, recruiterId}
             │
             ▼
    ✓ Job Created in MongoDB
    ✓ Added to Recruiter's Job List
    ✓ Frontend Shows in Dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: CANDIDATE APPLIES FOR JOB
┌──────────────────────────┐
│  Candidate Browses Jobs  │
│  GET /api/candidate-jobs │
└────────────┬─────────────┘
             │
             ▼
    Sees "Senior React Developer"
             │
             ▼
      Clicks "Apply Now"
             │
             ▼
┌──────────────────────────┐
│ Upload Resume (PDF/DOCX) │
└────────────┬─────────────┘
             │
             ▼
  POST /api/candidate-jobs/:jobId/apply
  {multipart: resume file}
             │
             ▼
    ✓ Resume Uploaded to /uploads
    ✓ Resume Parsed for Skills
       (Uses pdf-parse or mammoth)
             │
             ▼
    ✓ Match Score Calculated
       (Keyword overlap algorithm)
             │
             ▼
    ✓ Application Created in MongoDB:
    {
      job: ObjectId("..."),
      candidate: ObjectId("..."),
      resume: ObjectId("..."),
      matchScore: 85,
      status: "applied",
      createdAt: Date
    }
             │
             ▼
    ✓ Email Sent to Candidate:
      "Application Received"
             │
             ▼
    ✓ Frontend Shows:
      "Application Submitted"
      Job appears in "My Applications"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: RECRUITER VIEWS APPLICATIONS
┌──────────────────────────┐
│  Recruiter Dashboard     │
│  Sees Job Posting        │
└────────────┬─────────────┘
             │
             ▼
  Clicks "View Applications"
             │
             ▼
  GET /api/applications/job/:jobId
             │
             ▼
  ✓ Backend Returns:
  [{
    _id: ObjectId("..."),
    job: {...},
    candidate: {name, email},
    resume: {fileName, parsedData},
    matchScore: 85,
    status: "applied"
  }, ...]
             │
             ▼
  ✓ Frontend Displays:
  - Candidate name
  - Match score (85%)
  - Application date
  - Status
  - "View Details" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: RECRUITER REVIEWS APPLICATION
┌──────────────────────────┐
│  Recruiter Clicks        │
│  "View Details"          │
└────────────┬─────────────┘
             │
             ▼
  ApplicationDetailPage loads with:
  {applicationId, resumeId}
             │
             ▼
  ✓ Shows:
  - Candidate info (name, email)
  - Resume file
  - Parsed skills from resume
  - Match score breakdown
  - Status: "Applied"
  - "Schedule Interview" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: RECRUITER SCHEDULES INTERVIEW
┌──────────────────────────┐
│  Recruiter Clicks        │
│  "Schedule Interview"    │
└────────────┬─────────────┘
             │
             ▼
  Modal Opens:
  - Date Picker
  - Time Picker
  - Email Preview
             │
             ▼
  Recruiter Selects:
  Date: 2024-02-15
  Time: 14:00
             │
             ▼
  Clicks "Schedule"
             │
             ▼
  POST /api/interviews/schedule
  {
    applicationId: "...",
    scheduledTime: "2024-02-15T14:00:00Z"
  }
             │
             ▼
  ✓ Backend:
  1. Creates InterviewSession:
     {
       applicationId,
       candidateId,
       jobId,
       resumeId,
       scheduledTime,
       sessionLink: "/interview/{sessionId}",
       status: "scheduled"
     }
  
  2. Updates Application Status:
     status: "interview_scheduled"
     interviewSessionId: ObjectId("...")
     sessionLink: "http://localhost:3000/interview/..."
  
  3. Sends Email to Candidate:
     sendInterviewScheduledEmail()
             │
             ▼
  ✓ Email Sent:
  Subject: "Interview Scheduled - Senior React Developer"
  Body: HTML template with
    - Interview time
    - Job title
    - Recruiter name
    - "Join Interview" link
    - Call-to-action button
             │
             ▼
  ✓ Frontend:
  - Shows "Interview Scheduled Successfully"
  - Application status shows "Interview Scheduled" (blue)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 7: CANDIDATE RECEIVES EMAIL & VIEWS INTERVIEW
┌──────────────────────────┐
│  Candidate Email Inbox   │
│  New Interview Email ✓   │
└────────────┬─────────────┘
             │
             ▼
  Candidate Clicks Link in Email
  OR
  Logs into Dashboard
             │
             ▼
  GET /api/candidate-jobs (loads applications)
             │
             ▼
  ✓ Sees Application with:
  - Status: "Interview Scheduled" (blue)
  - Interview Date/Time
  - "Join Interview" button
  - "View Details" link
             │
             ▼
  Candidate Clicks "Join Interview"
             │
             ▼
  Frontend Navigates:
  /interview/{sessionId}
             │
             ▼
  GET /api/interviews/:sessionId
  (Get interview metadata)
             │
             ▼
  ✓ InterviewPage Loads:
  - Video/Audio controls
  - "Ready to start?" prompt
  - "Start Interview" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 8: CANDIDATE STARTS INTERVIEW
┌──────────────────────────┐
│  Candidate Clicks        │
│  "Start Interview"       │
└────────────┬─────────────┘
             │
             ▼
  PUT /api/interviews/:sessionId/start
  {status: "in_progress"}
             │
             ▼
  ✓ Backend:
  1. Updates InterviewSession:
     status: "in_progress"
     startedAt: Date.now()
  
  2. Fetches Questions:
     GET /api/interviews/questions/:jobId
             │
             ▼
  ✓ Gemini AI Generates Questions:
  Using jobDescription + skills
  
  Returns:
  [
    {
      id: "q1",
      type: "behavioral",
      text: "Tell me about a time you...",
      time: 60
    },
    {
      id: "q2",
      type: "behavioral",
      text: "How do you handle...",
      time: 60
    },
    {
      id: "q3",
      type: "technical",
      text: "Explain what is...",
      time: 120
    },
    {
      id: "q4",
      type: "coding",
      text: "Write a function that...",
      example: {input: "[1,2,3]", output: "6"},
      time: 300
    }
  ]
             │
             ▼
  ✓ Frontend:
  - Starts Interview Timer
  - Shows Question 1
  - Text Response Field
  - "Submit Answer" Button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 9: CANDIDATE ANSWERS QUESTIONS
┌──────────────────────────┐
│  Question 1: Behavioral  │
│  Candidate Types Answer  │
└────────────┬─────────────┘
             │
             ▼
  Clicks "Submit Answer"
             │
             ▼
  Frontend Sends:
  PUT /api/interviews/:sessionId/submit
  {
    questionId: "q1",
    response: "candidate's answer",
    duration: 45
  }
             │
             ▼
  ✓ Backend Receives Response
  ✓ Stores in responses array
  ✓ Calls Gemini to Evaluate:
    - Score (0-100)
    - Feedback
             │
             ▼
  ✓ Gemini Returns:
  {
    score: 78,
    feedback: "Good answer. You demonstrated...",
    strengths: ["Communication", "Problem-solving"],
    improvements: ["More specific examples"]
  }
             │
             ▼
  ✓ Response Saved:
  interviewResults.responses.push({
    questionId: "q1",
    question: "...",
    answer: "...",
    score: 78,
    feedback: "...",
    timestamp: Date
  })
             │
             ▼
  Frontend:
  - Shows "Answer Recorded"
  - Moves to Question 2
  - Clears text field

  [REPEAT FOR Q2, Q3, Q4]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 10: CANDIDATE SUBMITS INTERVIEW
┌──────────────────────────┐
│  After Question 4        │
│  Candidate Clicks        │
│  "Submit Interview"      │
└────────────┬─────────────┘
             │
             ▼
  PUT /api/interviews/:sessionId/submit
  {
    status: "completed",
    allResponses: [...]
  }
             │
             ▼
  ✓ Backend:
  1. Updates InterviewSession:
     status: "completed"
     completedAt: Date
  
  2. Calculates Total Score:
     Q1 Score: 78
     Q2 Score: 82
     Q3 Score: 75
     Q4 Score: 88
     Average: (78+82+75+88)/4 = 80.75 → 81
  
  3. Generates Summary with Gemini:
     summarizeInterview(allResponses)
     
     Returns:
     {
       overallScore: 81,
       summary: "Candidate demonstrated...",
       strengths: ["Strong technical knowledge..."],
       improvements: ["Could work on..."],
       recommendation: "Recommend for next round"
     }
  
  4. Updates Application:
     status: "completed"
     interviewResults: {
       score: 81,
       summary: "...",
       timestamp: Date
     }
  
  5. Updates InterviewSession:
     interviewResults: {
       score: 81,
       summary: "...",
       responses: [...],
       duration: 1245,
       completedAt: Date
     }
  
  6. Sends Email to Candidate:
     sendApplicationStatusUpdateEmail(
       {status: "interview_completed"}
     )
             │
             ▼
  ✓ Frontend:
  - Shows Completion Page
  - Score: 81/100
  - Duration: 20 minutes 45 seconds
  - "Interview completed successfully!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 11: RECRUITER VIEWS INTERVIEW RESULTS
┌──────────────────────────┐
│  Recruiter Dashboard     │
│  Application Shows:      │
│  Status: "Completed"     │
└────────────┬─────────────┘
             │
             ▼
  Clicks "View Details"
             │
             ▼
  ApplicationDetailPage:
  - Adds "Interview Results" section
  - Shows: Score 81/100
  - "View Full Results" button
             │
             ▼
  Clicks "View Full Results"
             │
             ▼
  GET /api/interviews/results/:sessionId
             │
             ▼
  ✓ Backend Returns:
  {
    applicationId: "...",
    candidateName: "Test Candidate",
    jobTitle: "Senior React Developer",
    score: 81,
    summary: "Candidate demonstrated...",
    responses: [
      {
        question: "Tell me about...",
        answer: "candidate's answer",
        score: 78,
        feedback: "Good answer..."
      },
      ... (4 questions total)
    ],
    duration: 1245,
    completedAt: Date
  }
             │
             ▼
  ✓ Frontend Shows:
  - Overall Score: 81/100 (Green - Excellent)
  - Interview Duration: 20:45
  - AI Summary: "..."
  - Each Question with:
    - Question text
    - Candidate's response
    - Score
    - AI Feedback
  - "Download Report" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 12: RECRUITER MAKES HIRING DECISION
┌──────────────────────────┐
│  Recruiter Reviews       │
│  All Information:        │
│  - Match Score: 85%      │
│  - Interview Score: 81   │
│  - Summary: Excellent    │
└────────────┬─────────────┘
             │
             ▼
  Clicks Status Dropdown
             │
             ▼
  Options:
  - Applied
  - Reviewing
  - Interview Scheduled
  - Accepted ✓
  - Rejected
             │
             ▼
  Selects "Accepted"
  (Optional: Adds comment)
             │
             ▼
  Clicks "Update Status"
             │
             ▼
  PUT /api/applications/:id
  {
    status: "accepted",
    comment: "Great fit for the team!"
  }
             │
             ▼
  ✓ Backend:
  1. Updates Application
  2. Sends Email to Candidate:
     "Congratulations! You've been selected"
     - Job title
     - Next steps
     - Contact info
             │
             ▼
  ✓ Frontend:
  - Shows "Status Updated"
  - Application now shows "Accepted" (Green)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATE SEES FINAL STATUS
┌──────────────────────────┐
│  Candidate Dashboard     │
│  "My Applications"       │
└────────────┬─────────────┘
             │
             ▼
  Application Shows:
  - Job: "Senior React Developer"
  - Status: "Accepted" ✓ (Green)
  - Interview Score: 81
  - "Congratulations!" message
  - Next steps in email
```

---

## 🔧 Data Flow Debugging Checklist

### ✅ Step 1: Registration/Login
- [ ] User can register (POST /api/auth/register returns token)
- [ ] Check MongoDB `users` collection has new document
- [ ] Token stored in localStorage
- [ ] Can login with registered credentials

**If fails:**
```
Check: Backend logs for errors
       Email format validation
       Password requirements
       MongoDB connection
```

### ✅ Step 2: Create Job
- [ ] Recruiter dashboard loads
- [ ] Can fill job form
- [ ] POST /api/jobs succeeds (check Network tab)
- [ ] Job appears in dashboard immediately
- [ ] Check MongoDB `jobs` collection has new document

**If fails:**
```
Check: Backend authentication middleware
       Job title validation
       Skills array validation
       MongoDB jobs collection creation
```

### ✅ Step 3: Browse Jobs
- [ ] Candidate dashboard loads
- [ ] GET /api/candidate-jobs returns all jobs
- [ ] Jobs display with titles and descriptions
- [ ] Can click on job card

**If fails:**
```
Check: authenticateToken middleware
       /api/candidate-jobs endpoint exists
       Jobs exist in database
       Browser Network tab for API response
```

### ✅ Step 4: Apply for Job
- [ ] Apply button visible
- [ ] Can select resume file
- [ ] File upload shows progress
- [ ] POST /api/candidate-jobs/:jobId/apply succeeds
- [ ] Check `/uploads` folder for resume file
- [ ] Check MongoDB `applications` collection

**If fails:**
```
Check: File upload middleware (multer)
       Resume parsing (pdf-parse/mammoth)
       Match score calculation
       Backend logs for errors
       File size limits
       Allowed file types
```

### ✅ Step 5: View Applications (Recruiter)
- [ ] GET /api/applications/job/:jobId called
- [ ] Applications list displays
- [ ] Match scores visible
- [ ] Candidate names correct
- [ ] "View Details" button works

**If fails:**
```
Check: Backend /api/applications/:jobId route
       MongoDB applications query
       Application join with candidate/resume
       Authorization: recruiter owns job
```

### ✅ Step 6: View Application Details
- [ ] Application detail page loads
- [ ] Candidate info displays
- [ ] Resume file name visible
- [ ] Parsed skills display
- [ ] Match score calculation correct
- [ ] "Schedule Interview" button visible

**If fails:**
```
Check: GET /api/applications/:id endpoint
       Resume parsing completed
       Match algorithm working
       Frontend page receiving data
```

### ✅ Step 7: Schedule Interview
- [ ] Schedule button clickable
- [ ] Modal opens with date/time picker
- [ ] Can select date and time
- [ ] POST /api/interviews/schedule called
- [ ] Check MongoDB `interviewsessions` collection
- [ ] Application status updated
- [ ] Email sent (check logs)

**If fails:**
```
Check: POST /api/interviews/schedule endpoint
       InterviewSession model creation
       sessionLink generation
       Email service configuration
       Nodemailer SMTP settings
```

### ✅ Step 8: Candidate Receives Email
- [ ] Email in inbox (if Gmail configured)
- [ ] Contains interview time
- [ ] Contains join link
- [ ] Link format correct: /interview/{sessionId}
- [ ] Email subject correct

**If fails:**
```
Check: GMAIL_USER in .env
       GMAIL_PASSWORD (app-specific)
       emailService.ts sendInterviewScheduledEmail
       Email templates
       Nodemailer logs
```

### ✅ Step 9: Candidate Views Interview
- [ ] GET /api/candidate-jobs returns applications
- [ ] Application shows "Interview Scheduled"
- [ ] Interview date displays
- [ ] "Join Interview" button visible
- [ ] Click navigates to /interview/:sessionId

**If fails:**
```
Check: Application status updated to "interview_scheduled"
       sessionLink saved in application
       Frontend routing /interview/:sessionId
```

### ✅ Step 10: Start Interview
- [ ] InterviewPage loads
- [ ] Camera/mic permission prompt
- [ ] "Start Interview" button works
- [ ] PUT /api/interviews/:sessionId/start called
- [ ] GET /api/interviews/questions/:jobId called
- [ ] Questions display (from Gemini)

**If fails:**
```
Check: sessionId valid in database
       Gemini API key in .env
       Gemini question generation
       Browser console for errors
       Camera/mic permissions
```

### ✅ Step 11: Answer Questions
- [ ] Question displays
- [ ] Response text area works
- [ ] Can type answer
- [ ] Submit button works
- [ ] PUT /api/interviews/:sessionId/submit called
- [ ] Backend evaluates with Gemini
- [ ] Moves to next question

**If fails:**
```
Check: Frontend answer submission
       Backend Gemini evaluation
       Interview session updating
       Responses array in database
       Error logs for API timeouts
```

### ✅ Step 12: Complete Interview
- [ ] After 4 questions, submit works
- [ ] Interview completion page shows
- [ ] Score displays (0-100)
- [ ] Duration shows
- [ ] Application status updated to "completed"
- [ ] Email sent to candidate

**If fails:**
```
Check: All 4 responses received
       Gemini score calculation
       Score saved correctly
       Application status update
       Email trigger
```

### ✅ Step 13: View Results (Recruiter)
- [ ] Application shows "Completed" status
- [ ] "View Results" button visible
- [ ] GET /api/interviews/results/:sessionId called
- [ ] Results page displays:
  - Score
  - Summary
  - Question breakdown
  - Feedback
- [ ] Download button works

**If fails:**
```
Check: /api/interviews/results/:sessionId endpoint
       InterviewSession results field populated
       Gemini summary generated
       Frontend results page rendering
```

---

## 🛠️ MongoDB Verification Commands

### Check Database Exists
```
mongosh
> show databases
recruitment-tool  (should exist)
> use recruitment-tool
> show collections
```

### Check Collections Have Data
```
> db.users.find().pretty()
> db.jobs.find().pretty()
> db.applications.find().pretty()
> db.resumes.find().pretty()
> db.interviewsessions.find().pretty()
```

### Sample Application Document
```
> db.applications.findOne()
{
  "_id": ObjectId("..."),
  "job": ObjectId("..."),
  "candidate": ObjectId("..."),
  "resume": ObjectId("..."),
  "matchScore": 85,
  "status": "completed",
  "interviewSessionId": ObjectId("..."),
  "interviewResults": {
    "score": 81,
    "summary": "...",
    "timestamp": ISODate("2024-02-15T14:45:00Z")
  },
  "createdAt": ISODate("2024-02-14T10:00:00Z")
}
```

---

## 🌐 Network Debugging

### Check API Calls in Browser
1. Press F12 (Developer Tools)
2. Go to "Network" tab
3. Perform action (apply, schedule, etc.)
4. Look for API calls:
   - Should see GET/POST/PUT calls to `localhost:5000/api/...`
   - Check Response tab for data
   - Check Status codes:
     - 200 = Success
     - 400 = Bad request
     - 401 = Unauthorized
     - 500 = Server error

### Sample Request/Response
```
POST /api/candidate-jobs/job123/apply
Status: 200
Response: {
  "success": true,
  "application": {
    "_id": "...",
    "matchScore": 85,
    "status": "applied"
  }
}
```

---

## 📝 Logging & Troubleshooting

### Backend Logs to Watch For
- "✓ Server running on http://localhost:5000"
- "✓ MongoDB connected successfully"
- API request logs (POST /api/...)
- Gemini API calls
- Email sending logs

### Frontend Logs to Watch For
- React component mounts
- API calls made
- Data received from backend
- Navigation events

### Common Error Messages
```
"Cannot connect to MongoDB" 
→ MongoDB service not running

"Invalid JWT token"
→ Token expired or tampered

"Resume parsing failed"
→ Invalid file format or corrupted file

"Gemini API error"
→ Invalid API key or quota exceeded

"Email sending failed"
→ Gmail credentials wrong or app password incorrect
```

---

## ✅ Full Flow Verification

To verify complete flow works:

1. **Terminal 1**: Confirm backend running
   ```
   npm run dev (in backend/)
   Expected: ✓ Server running on http://localhost:5000
   ```

2. **Terminal 2**: Confirm frontend running
   ```
   npm run dev (in client/)
   Expected: Local: http://localhost:3000
   ```

3. **MongoDB**: Confirm connected
   ```
   mongosh
   use recruitment-tool
   show collections (should have users, jobs, etc.)
   ```

4. **Test Steps 1-13** from above data flow diagram

5. **Verify MongoDB**: After each step
   ```
   Check collections for new documents
   Verify fields are correct
   ```

6. **Check Logs**: Monitor both terminals
   ```
   Backend: API calls, Gemini responses, email sends
   Frontend: Component loads, API responses
   ```

---

**Good luck troubleshooting! The data flow should work end-to-end now! 🎯**
