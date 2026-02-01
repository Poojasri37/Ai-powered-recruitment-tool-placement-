# ✅ Recruiter Dashboard - Candidate Applications & Interview Scheduling

## 📋 Overview

The recruiter dashboard now has a complete workflow for:
- ✅ Viewing all applications from candidates
- ✅ Seeing match scores (0-100%)
- ✅ Reviewing candidate resumes and parsed skills
- ✅ Scheduling interviews with proper authorization
- ✅ Sending interview invitations via email
- ✅ Tracking interview status

---

## 🚀 Complete Workflow

### Step 1: Recruiter Dashboard
```
http://localhost:3000/dashboard
```

**What you see:**
- List of your posted jobs
- "View Applications" button on each job card
- Quick stats (total jobs, applications, etc.)

---

### Step 2: View Job Applications
```
Click "View Applications" on any job card
Navigates to: /job-applications/{jobId}
```

**Application List Shows:**
- ✅ Candidate name & email
- ✅ Match score (0-100%) - large blue number
- ✅ Application status badge (Applied, Reviewing, Scheduled, etc.)
- ✅ Application date
- ✅ "View Details" button for each application

**Status Color Codes:**
- 🔵 Blue: Applied / Interview Scheduled
- 🟡 Yellow: Reviewing
- 🟢 Green: Accepted
- 🔴 Red: Rejected

---

### Step 3: View Application Details
```
Click "View Details" on any application
Navigates to: /application/{applicationId}
```

**Information Displayed:**

#### Candidate Info
```
┌─────────────────────────────────────────┐
│ Candidate Name                          │
│ Applied for: Senior React Developer    │
│                                         │
│ Email: candidate@test.com               │
│ Phone: (if available)                   │
│                                         │
│ Skills: React, TypeScript, Node.js... │
│                                         │
│ Match Score: 85%                        │
└─────────────────────────────────────────┘
```

#### Resume Information
```
✓ Download Resume button
✓ Parsed skills from resume
✓ Education & Experience sections
✓ File name & upload date
```

#### Application Status
```
Status Badge: "APPLIED" (with color)
Application Date: {date}

For "Applied" status:
  └─ [Schedule Interview] button

For "Interview Scheduled" status:
  └─ Interview Date: {datetime}
  └─ [Session Link] button
```

---

### Step 4: Schedule Interview
```
Click "Schedule Interview" button
```

**Interview Scheduling Form:**

```
┌─────────────────────────────────────────────────┐
│ 📅 Schedule Interview                           │
│                                                 │
│ Interview Date & Time: [datetime picker]        │
│ (Must be in future)                             │
│                                                 │
│ ✓ Interview Details:                            │
│   • Candidate will receive email invitation     │
│   • Interview session link will be generated    │
│   • 4 Gemini AI questions will be asked         │
│   • Responses will be evaluated in real-time    │
│                                                 │
│ [✓ Schedule Interview]  [Cancel]               │
└─────────────────────────────────────────────────┘
```

**What Happens When You Click "Schedule":**

1. ✅ Backend verifies authorization (recruiter owns job)
2. ✅ Creates InterviewSession in database
3. ✅ Generates unique session link
4. ✅ Updates application status to "interview_scheduled"
5. ✅ Sends email to candidate with:
   - Interview time
   - Job title
   - Recruiter name
   - Join link
6. ✅ Success message shows with updated status

---

### Step 5: Application Status Updates

**After Scheduling:**
- Status changes to: "INTERVIEW SCHEDULED" (blue badge)
- Interview date displays with calendar icon
- Session link shows in a blue box
- "Schedule Interview" button is replaced with display-only info

**Email Sent to Candidate:**
```
Subject: Interview Scheduled - Senior React Developer

Body:
Hello {candidate_name},

Your interview has been scheduled!

📅 Interview Date & Time: {scheduled_datetime}
💼 Position: {job_title}
👤 Recruiter: {recruiter_name}

🔗 Join Interview: [clickable link]

Best regards,
{recruiter_name}
```

---

## 🔄 Data Flow in Backend

### API Endpoint: POST /api/interviews/schedule

**Request:**
```json
{
  "applicationId": "507f1f77bcf86cd799439011",
  "scheduledTime": "2024-02-15T14:00:00Z"
}
```

**Authorization Check:**
```
1. Extract userId from JWT token
2. Get application by ID
3. Get job from application
4. Verify: job.recruiter === userId
5. If not match → 403 Unauthorized
```

**What Gets Created:**

1. **InterviewSession Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "applicationId": "507f1f77bcf86cd799439011",
  "candidateId": "507f1f77bcf86cd799439013",
  "jobId": "507f1f77bcf86cd799439014",
  "resumeId": "507f1f77bcf86cd799439015",
  "scheduledTime": "2024-02-15T14:00:00Z",
  "sessionLink": "/interview/f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "scheduled"
}
```

2. **Application Update:**
```json
{
  "status": "interview_scheduled",
  "interviewDate": "2024-02-15T14:00:00Z",
  "sessionLink": "/interview/f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "interviewSessionId": "507f1f77bcf86cd799439012"
}
```

3. **Email Sent via Nodemailer:**
```
To: {candidate.email}
Subject: Interview Scheduled - {job.title}
Template: Interview scheduled HTML email with button
```

---

## 📊 Application Statuses & Actions

| Status | Display | Actions Available |
|--------|---------|-------------------|
| **applied** | Blue Badge | Schedule Interview |
| **reviewing** | Yellow Badge | - (after schedule, can change) |
| **interview_scheduled** | Blue Badge | View interview link |
| **accepted** | Green Badge | - (final status) |
| **rejected** | Red Badge | - (final status) |

---

## 🔐 Security & Authorization

**Recruiter Can Only:**
- ✅ View applications for their own jobs
- ✅ Schedule interviews for their own jobs
- ✅ Cannot access other recruiters' applications
- ✅ Cannot schedule for jobs they don't own

**Error Responses:**
```
401 Unauthorized
├─ No valid JWT token
├─ Token expired

403 Forbidden
├─ Not the recruiter who posted the job
├─ Trying to access another recruiter's job

404 Not Found
├─ Application doesn't exist
├─ Job doesn't exist
```

---

## 📧 Email Configuration

**For Emails to Actually Send:**

1. Add to backend `.env`:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password-16-chars
FRONTEND_URL=http://localhost:3000
```

2. Get Gmail App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Generate password for "Mail"
   - Copy 16-character password
   - Paste into .env

3. Restart backend:
```bash
npm run dev
```

**Without Setup:**
- Emails won't send, but interview still schedules
- Check backend logs to see email attempt
- Test email by checking console.error logs

---

## 🧪 Test Scenarios

### Scenario 1: Complete Interview Scheduling

**Recruiter Steps:**
1. Log in as: recruiter@test.com / test123
2. View Dashboard
3. Click "View Applications" on a job
4. Select a candidate application
5. Click "Schedule Interview"
6. Pick a date/time in the future
7. Click "Schedule Interview" button
8. See success message
9. Confirm status changed to "INTERVIEW SCHEDULED"

**Result:**
✅ Application status updated
✅ Interview session created
✅ Email sent to candidate (if configured)
✅ Session link generated

### Scenario 2: View Scheduled Interview Info

**Recruiter Steps:**
1. After scheduling, refresh page
2. See application with "INTERVIEW SCHEDULED" status
3. See interview date/time displayed
4. See session link (if needed to share)

**Result:**
✅ All information persists
✅ Can use link to monitor interview

### Scenario 3: Multiple Applications

**Recruiter Steps:**
1. Create multiple job postings
2. Have different candidates apply
3. View applications for each job
4. Schedule interviews for different candidates
5. See all scheduled interviews in separate lists

**Result:**
✅ Can manage multiple interviews
✅ Each candidate gets correct link
✅ Each interview is tracked separately

---

## 🐛 Troubleshooting

### Issue: "Not authorized to schedule interviews"

**Cause:** Not the recruiter who posted the job

**Fix:**
- Use correct recruiter account
- Make sure logged in as recruiter who created job
- Check JWT token is valid

### Issue: "Application not found"

**Cause:** Wrong applicationId or application was deleted

**Fix:**
- Refresh page to get correct ID
- Make sure application exists
- Try different application

### Issue: "Interview date must be in the future"

**Cause:** Trying to schedule in the past

**Fix:**
- Use datetime picker to select future date/time
- Today's date/time minimum is enforced

### Issue: Email not received by candidate

**Cause:** Email service not configured

**Fix:**
- Add Gmail credentials to .env
- Restart backend
- Check spam folder
- Verify email address is correct

### Issue: Form shows but won't submit

**Cause:** Missing date selection or form validation error

**Fix:**
- Make sure to select a date and time
- Check browser console for errors (F12)
- Try refreshing page

---

## 📱 UI Components

### Application Card (in List)
```
┌─────────────────────────────────────┐
│ John Doe                    85%     │
│ john@email.com              APPLIED │
│                                     │
│ Interview: 2024-02-15 14:00         │
│                                     │
│ [View Details]                      │
│ Applied 2024-02-14                  │
└─────────────────────────────────────┘
```

### Interview Scheduled Box
```
┌──────────────────────────────────────┐
│ 📅 Interview Scheduled               │
│ Thu Feb 15, 2024 2:00:00 PM UTC     │
│ [Session Link →]                    │
└──────────────────────────────────────┘
```

### Schedule Form
```
┌──────────────────────────────────────┐
│ 📅 Schedule Interview                │
│                                      │
│ Interview Date & Time:               │
│ [datetime picker field]              │
│ Select a future date and time        │
│                                      │
│ ✓ Interview Details:                 │
│ • Candidate will receive email       │
│ • Session link will be generated     │
│ • 4 Gemini AI questions will be asked│
│ • Responses evaluated in real-time   │
│                                      │
│ [✓ Schedule Interview] [Cancel]      │
└──────────────────────────────────────┘
```

---

## ✅ Complete Feature Checklist

### Recruiter Dashboard
- [x] View all posted jobs
- [x] View applications per job
- [x] View candidate details
- [x] Download resume
- [x] See match score
- [x] See application date
- [x] Check application status

### Interview Scheduling
- [x] Schedule interview with date/time picker
- [x] Verify future date only
- [x] Generate session link
- [x] Update application status
- [x] Create interview session
- [x] Send email to candidate

### Security
- [x] Verify recruiter owns job
- [x] Check JWT token
- [x] Return 403 if not authorized
- [x] Validate email permissions

### Email Notifications
- [x] Interview scheduled email
- [x] HTML template
- [x] Include interview date/time
- [x] Include session link
- [x] Include job title
- [x] Include recruiter name

---

## 🎯 Next Steps

1. ✅ Test scheduling workflow
2. ✅ Verify emails send (with Gmail config)
3. ✅ Test candidate receives email
4. ✅ Test candidate joins interview
5. ✅ Test interview questions and evaluation
6. ✅ Test recruiter views results

---

**All systems ready! Happy recruiting! 🚀**
