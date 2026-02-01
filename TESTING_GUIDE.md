# 🧪 Complete Application Testing Guide

## ✅ Current Status
- ✓ Backend running on http://localhost:5000
- ✓ Frontend running on http://localhost:3000  
- ✓ MongoDB connected
- ✓ All TypeScript compilation successful
- ✓ All dependencies installed

---

## 🚀 End-to-End Test Workflow

### **Phase 1: Recruiter Setup (5 mins)**

#### Step 1: Register as Recruiter
1. Open http://localhost:3000
2. Click on **"Recruiter"** radio button (if not already selected)
3. Fill in registration:
   - Email: `recruiter@test.com`
   - Password: `password123`
   - Name: `Test Recruiter`
4. Click "Sign Up"
5. ✓ Should redirect to Recruiter Dashboard

#### Step 2: Verify Dashboard
- See "Create Job" button
- Empty job list initially
- No applications yet

#### Step 3: Create a Job Posting
1. Click **"+ Create Job"** button
2. Fill in job details:
   - **Title**: `Senior React Developer`
   - **Description**: `We are looking for an experienced React developer with TypeScript experience. You will work on building scalable web applications with modern tooling and practices.`
   - **Required Skills** (type each and press Enter):
     - React
     - TypeScript  
     - Node.js
     - REST APIs
3. Click **"Create Job"** button
4. ✓ Job should appear in dashboard
5. ✓ Should see **"View Applications"** button on job card

---

### **Phase 2: Candidate Application (5 mins)**

#### Step 4: Create Candidate Account
1. **Open new incognito/private browser tab** (to stay logged in as recruiter in first tab)
2. Go to http://localhost:3000
3. Click **"Candidate"** radio button
4. Register:
   - Email: `candidate@test.com`
   - Password: `password123`
   - Name: `Test Candidate`
5. Click "Sign Up"
6. ✓ Should redirect to Candidate Dashboard

#### Step 5: Verify Candidate Dashboard
- See "Available Jobs" section
- Should see the job: "Senior React Developer"
- See match percentage if resume uploaded

#### Step 6: Apply to Job with Resume
1. On the job card, click **"Apply Now"** button
2. Choose a resume file to upload:
   - Can be any PDF or DOCX file
   - Or create a simple test file with skills: React, TypeScript, Python, SQL
3. Click **"Apply"**
4. ✓ Should see success message
5. ✓ Job should move to "My Applications" section
6. ✓ Status should show: **"Applied"** (blue indicator)
7. ✓ Match score displayed (0-100%)

**What's happening in backend:**
- Resume parsed for skills
- Match score calculated against job requirements
- Application saved to MongoDB
- Email sent to recruiter (optional, depends on .env setup)

---

### **Phase 3: Recruiter Views Applications (5 mins)**

#### Step 7: Switch Back to Recruiter Tab
1. Go back to first browser tab (recruiter logged in)
2. Refresh the page if needed
3. On the "Senior React Developer" job card, click **"View Applications"**

#### Step 8: Verify Applications List
✓ Should see:
- Candidate name: "Test Candidate"
- Application status: **Applied**
- Match score: **XX%** (e.g., 80%)
- Applied date
- **"View Details"** button

#### Step 9: View Application Details
1. Click **"View Details"** on candidate application
2. ✓ Should see:
   - **Candidate Info**: Name, email
   - **Resume Section**: 
     - File name
     - **Download Resume** button
     - **Parsed Skills**: List of extracted skills from resume
   - **Match Score**: X% with breakdown
   - **"Schedule Interview"** button

---

### **Phase 4: Schedule Interview & Email (5 mins)**

#### Step 10: Schedule Interview
1. On Application Detail page, click **"Schedule Interview"** button
2. Modal should appear with:
   - Date/Time picker
   - Preview of email to be sent
3. Select a date/time (e.g., tomorrow at 2:00 PM)
4. Click **"Schedule"**
5. ✓ Should see success confirmation

**What's happening:**
- Interview session created in MongoDB (InterviewSession collection)
- Application status updated to: **Interview Scheduled**
- Email triggered to candidate (if Gmail setup in .env)
- Email contains:
  - Interview time
  - Session link: `http://localhost:3000/interview/{sessionId}`
  - Job title
  - Recruiter name

#### Step 11: Verify Email Sent (If Gmail Configured)
1. Check candidate's email inbox
2. Should have email titled: **"Interview Scheduled - [Job Title]"**
3. Email contains session link

**Note**: If Gmail not configured in .env, that's okay. We can test the link directly.

---

### **Phase 5: Candidate Attends Interview (10 mins)**

#### Step 12: Switch to Candidate Tab
1. Go to candidate browser tab (or login again if needed)
2. Click **"My Applications"**
3. ✓ Should see application with status: **"Interview Scheduled"** (blue)
4. ✓ Should see interview date/time
5. ✓ Should see **"Join Interview"** button (if interview is scheduled)

#### Step 13: Join Interview
1. Click **"Join Interview"** button
2. ✓ Should navigate to Interview Page
3. ✓ Should show:
   - Camera/Microphone controls (request permissions)
   - Countdown timer "5 seconds to start..."
   - "Ready to start?" message

#### Step 14: Start Interview
1. Click **"Start Interview"** button
2. Wait 5 seconds
3. ✓ Should see:
   - First interview question
   - Question type badge (e.g., "Behavioral")
   - Response text area
   - Timer showing time elapsed

#### Step 15: Answer Questions
1. **Question 1 (Behavioral)**: Type a response
   - E.g., "I once led a project to refactor our codebase..."
2. Click **"Submit Answer"** button
3. ✓ Should move to Question 2
4. Repeat for all 4 questions:
   - Question 2 (Behavioral)
   - Question 3 (Technical)
   - Question 4 (Coding Challenge)

#### Step 16: Code Submission (if Coding Question)
1. Code editor appears for coding question
2. Type or paste sample code
3. Can toggle between JavaScript/Python/Java
4. Click **"Submit Answer"**
5. ✓ Moves to next question

#### Step 17: Complete Interview
1. After all 4 questions answered, click **"Submit Interview"**
2. ✓ Gemini AI processes responses (might take 3-5 seconds)
3. ✓ Should see completion page with:
   - **Interview Score**: X/100 (AI-calculated)
   - Interview duration
   - "Interview completed successfully!"
   - **"View Results"** button (if available)

**What's happening:**
- Each response sent to Gemini AI for evaluation
- AI generates evaluation feedback
- Overall score calculated
- Results saved to database
- Interview session marked as "Completed"

---

### **Phase 6: Recruiter Reviews Interview Results (5 mins)**

#### Step 18: Switch Back to Recruiter Tab
1. Go back to recruiter tab
2. Refresh or navigate to job applications
3. ✓ Application status should be: **"Completed"** (or "Interview_Completed")
4. Click **"View Details"** on the application

#### Step 19: View Interview Results
1. ✓ Should show:
   - Interview date/time completed
   - **Overall Score**: XX/100
   - **AI Evaluation**: Summary feedback
   - **Question Breakdown**:
     - Question 1 text
     - Candidate's answer
     - AI feedback & score
     - (repeat for all questions)
   - **Code Submission** (if applicable):
     - Submitted code
     - AI evaluation
   - **Interview Transcript**: Full Q&A
2. ✓ Should see **"Download Report"** button (if implemented)

#### Step 20: Make Hiring Decision
1. Update application status:
   - Select "Accepted" or "Rejected"
   - Add optional comment
   - Click "Update Status"
2. ✓ Email sent to candidate with decision

---

## 📊 Data Flow Verification Checklist

### Backend Routes Tested
- [ ] POST `/api/auth/register` - User registration
  - Response includes user ID, email, role
- [ ] POST `/api/auth/login` - User login
  - Response includes JWT token
- [ ] POST `/api/jobs` - Create job
  - Response includes job ID
- [ ] GET `/api/jobs` - List jobs
  - Response includes all jobs (recruiter's own)
- [ ] GET `/api/candidate-jobs` - Candidate views jobs
  - Response includes all posted jobs
- [ ] POST `/api/candidate-jobs/:jobId/apply` - Candidate applies
  - Requires multipart/form-data with resume file
  - Calculates match score
  - Creates Application document
- [ ] GET `/api/applications/job/:jobId` - Recruiter views applications
  - Response includes all applications for job
  - Includes match scores, status
- [ ] POST `/api/interviews/schedule` - Schedule interview
  - Creates InterviewSession
  - Sends email to candidate
  - Updates Application status
- [ ] GET `/api/interviews/questions/:jobId` - Get Gemini questions
  - Response includes 4 interview questions
- [ ] PUT `/api/interviews/:sessionId/start` - Start interview
  - Updates session status to "in_progress"
- [ ] PUT `/api/interviews/:sessionId/submit` - Submit responses
  - Gemini evaluates responses
  - Calculates score
  - Saves results
- [ ] GET `/api/interviews/results/:sessionId` - Get results
  - Recruiter views interview evaluation

---

## 🔍 Expected Database Changes

### MongoDB Collections Check
1. Open MongoDB Compass or `mongo` CLI
2. Database: `recruitment-tool`
3. Collections should exist:
   - **users**: 2+ documents (recruiter, candidate)
   - **jobs**: 1+ document (created job)
   - **applications**: 1+ document (candidate application)
   - **resumes**: 1+ document (uploaded resume)
   - **interviewsessions**: 1+ document (scheduled interview)

### Sample Application Document
```json
{
  "_id": ObjectId("..."),
  "job": ObjectId("..."),
  "candidate": ObjectId("..."),
  "resume": ObjectId("..."),
  "matchScore": 85,
  "status": "completed",
  "interviewDate": "2024-02-15T14:00:00Z",
  "interviewSessionId": ObjectId("..."),
  "sessionLink": "http://localhost:3000/interview/sessionId",
  "interviewResults": {
    "score": 78,
    "summary": "Candidate demonstrated strong React knowledge...",
    "timestamp": "2024-02-15T14:45:00Z"
  },
  "createdAt": "2024-02-14T10:00:00Z"
}
```

---

## 🐛 Troubleshooting During Testing

### Issue: Can't Register
**Solution**: 
- Check backend console for errors
- Verify email not already registered
- Check password requirements (if any)

### Issue: Application Not Appearing in Recruiter Dashboard
**Solution**:
- Refresh page
- Check browser console for errors
- Verify candidate used correct job ID
- Check MongoDB for Application document
- Check backend logs for parsing errors

### Issue: Interview Schedule Button Disabled
**Solution**:
- Verify application status is "applied"
- Check recruiter is viewing correct application
- Verify backend is running

### Issue: Email Not Received
**Solution**:
- Check .env has EMAIL_USER and EMAIL_PASSWORD
- Verify Gmail app password is correct (16 chars)
- Check spam folder
- Check backend logs for email errors

### Issue: Gemini Questions Not Loading
**Solution**:
- Verify GEMINI_API_KEY in .env
- Check API quota on Google Cloud Console
- Check backend logs for API errors
- Verify network tab shows API call

### Issue: Interview Page Blank
**Solution**:
- Allow camera/microphone permissions
- Check browser console for errors
- Verify sessionId in URL matches database
- Refresh page

### Issue: Can't Submit Interview
**Solution**:
- Answer all 4 questions
- Check browser console for errors
- Verify answers are not empty
- Check backend connection

---

## 📈 Performance Testing Notes

- Application creation should take < 1 second
- Resume parsing takes 2-5 seconds depending on file size
- Interview question generation takes 3-5 seconds (Gemini API)
- Interview response evaluation takes 2-4 seconds per response
- Interview completion score calculation takes 5-10 seconds

---

## ✅ Success Criteria

Your application is **COMPLETE** when ALL of these are true:

- [x] Both servers start without errors
- [ ] Recruiter can register and create jobs
- [ ] Candidate can register and view jobs
- [ ] Candidate can apply with resume upload
- [ ] Recruiter sees application with match score
- [ ] Recruiter can schedule interview
- [ ] Candidate receives email with interview link
- [ ] Candidate can join interview
- [ ] Gemini generates interview questions
- [ ] Candidate can submit responses
- [ ] Recruiter can view interview results with AI evaluation
- [ ] Interview score calculated correctly
- [ ] All statuses update correctly throughout flow
- [ ] No console errors during testing
- [ ] No database errors in backend logs

---

## 📝 Notes for Refinement

After testing completes, consider:
1. **Email validation**: Verify emails are formatted correctly
2. **Error messages**: Add user-friendly error notifications
3. **Loading states**: Add loading indicators during API calls
4. **Pagination**: Add pagination for large application lists
5. **Search/Filter**: Add search by candidate name or status
6. **Interview rescheduling**: Allow rescheduling if needed
7. **Candidate decline**: Let candidate decline interview
8. **Feedback form**: Recruiter can add notes to applications

---

## 🎯 Next Steps

1. **Run through entire workflow** following steps 1-20 above
2. **Check MongoDB** to verify data is being saved
3. **Review backend logs** for any errors
4. **Test error cases**:
   - Try applying without uploading resume (should fail)
   - Try scheduling without selecting time (should fail)
   - Try accessing interview with wrong session ID
5. **Performance test**: Time each major operation
6. **Email test**: If Gmail setup, verify email receipt
7. **Deploy**: When all tests pass, app is ready for production

---

**Good luck with your AI-Powered Recruitment Tool! 🚀**
