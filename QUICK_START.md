# 🚀 AI-Powered Recruitment Tool - QUICK START

## ✅ Current Status: READY TO USE

Both servers are running:
- **Backend**: http://localhost:5000 ✓
- **Frontend**: http://localhost:3000 ✓

---

## 🎯 Fast Track: 5-Minute Test

### Recruiter (Tab 1)
```
1. Open: http://localhost:3000
2. Select: Recruiter
3. Email: recruiter@test.com
4. Password: test123
5. Create Job: "React Developer"
6. Wait for candidate to apply
7. Click "View Applications"
8. Click "View Details"
9. Schedule Interview (pick any date/time)
```

### Candidate (Tab 2 - Incognito)
```
1. Open: http://localhost:3000 (incognito)
2. Select: Candidate
3. Email: candidate@test.com
4. Password: test123
5. Find: "React Developer" job
6. Click: "Apply Now"
7. Upload: Any PDF/DOCX file (or create test.docx)
8. After scheduling: Click "Join Interview"
9. Answer 4 questions
10. Submit
```

---

## 🔧 System Requirements

✓ Node.js v18+
✓ MongoDB running (localhost:27017)
✓ Port 3000 (Frontend) - available
✓ Port 5000 (Backend) - available
✓ Gemini API Key - configured ✓

---

## 📧 Email Setup (Optional)

If you want interview scheduling emails to work:

1. Go to Google Account: https://myaccount.google.com/apppasswords
2. Create App Password for "Mail"
3. Copy 16-character password
4. Update `.env` in backend:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```
5. Restart backend: `npm run dev`

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot GET /" | Open http://localhost:3000 not http://localhost:5000 |
| MongoDB connection error | Start MongoDB: `mongod` or use Atlas URI |
| Port 3000/5000 already in use | Kill process or use different port |
| "Cannot find module" | Run `npm install` in that folder |
| Email not sending | Add valid Gmail credentials to .env |
| Questions not appearing | Check Gemini API key in .env |
| Application not appearing | Refresh recruiter page after candidate applies |

---

## 📂 Project Structure

```
d:\AI powered Recruitment tool\
├── backend/           (Node.js/Express server)
│   └── src/
│       ├── routes/    (API endpoints)
│       ├── models/    (MongoDB schemas)
│       └── server.ts  (Main server file)
├── client/            (React frontend)
│   └── src/
│       ├── pages/     (React components)
│       └── App.tsx    (Main app)
├── README.md          (Full documentation)
├── TESTING_GUIDE.md   (Step-by-step test guide)
└── QUICK_START.md     (This file)
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Login

### Jobs (Recruiter)
- `POST /api/jobs` - Create job
- `GET /api/jobs` - List recruiter's jobs
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Candidate Jobs
- `GET /api/candidate-jobs` - Browse all jobs
- `POST /api/candidate-jobs/:jobId/apply` - Apply with resume

### Applications (Recruiter)
- `GET /api/applications/job/:jobId` - View applications
- `PUT /api/applications/:id` - Update status
- `DELETE /api/applications/:id` - Delete application

### Interviews
- `POST /api/interviews/schedule` - Schedule interview
- `GET /api/interviews/questions/:jobId` - Get AI questions
- `PUT /api/interviews/:sessionId/start` - Start interview
- `PUT /api/interviews/:sessionId/submit` - Submit responses
- `GET /api/interviews/results/:sessionId` - View results

---

## 💾 Database

MongoDB will auto-create on first run:
- **Database**: `recruitment-tool`
- **Collections**:
  - `users` - Recruiters & candidates
  - `jobs` - Job postings
  - `applications` - Job applications
  - `resumes` - Uploaded resumes
  - `interviewsessions` - Interview sessions & results

---

## 🎬 Features

### ✅ Recruiter Features
- Create/edit/delete job postings
- View all applications with match scores
- Review candidate resumes
- Schedule interviews
- View AI-evaluated interview results
- Make hiring decisions

### ✅ Candidate Features
- Browse available jobs
- Apply with resume upload
- Track application status
- Join scheduled interviews
- Answer AI-generated questions
- View interview scores

### ✅ AI Features (Gemini)
- Auto-generate interview questions based on job
- Evaluate candidate responses in real-time
- Score interview performance
- Generate summary feedback
- Analyze code submissions

---

## 📊 Interview Flow

```
Candidate Applies
       ↓
Recruiter Sees Application (+match score)
       ↓
Recruiter Schedules Interview
       ↓
Candidate Gets Email + Join Link
       ↓
Candidate Joins Interview
       ↓
4 AI-Generated Questions (2 behavioral, 1 technical, 1 coding)
       ↓
Gemini Evaluates Responses (Real-time)
       ↓
Interview Submitted
       ↓
AI Generates Score & Feedback
       ↓
Recruiter Views Results
       ↓
Hiring Decision
```

---

## 🧪 Test Data

Ready to use:
```
Recruiter:
- Email: recruiter@test.com
- Password: test123

Candidate:
- Email: candidate@test.com
- Password: test123

Job Posting Example:
- Title: "Senior React Developer"
- Skills: React, TypeScript, Node.js
```

---

## 📝 Resume File Format

Accepts:
- ✓ PDF files (.pdf)
- ✓ Word documents (.docx)
- ✓ Max size: 5MB

---

## 🚨 Need Help?

1. **Check Server Status**: Go to http://localhost:5000/health
2. **Review Backend Logs**: Look at terminal where you ran `npm run dev`
3. **Check Browser Console**: Press F12 → Console tab
4. **See Full Guide**: Read `TESTING_GUIDE.md`
5. **Read Docs**: Open `README.md`

---

## 🎯 Success Checklist

- [ ] Backend running (http://localhost:5000)
- [ ] Frontend running (http://localhost:3000)
- [ ] Can register as recruiter
- [ ] Can register as candidate
- [ ] Can create job
- [ ] Can apply to job
- [ ] Can see application in recruiter dashboard
- [ ] Can schedule interview
- [ ] Can join interview
- [ ] Can answer questions
- [ ] Can view results

---

## ⚡ Performance Tips

- Clear browser cache if styles look weird: `Ctrl+Shift+Delete`
- Hard refresh page: `Ctrl+F5`
- Check MongoDB connection: Is `mongod` running?
- Check API connectivity: Is backend on port 5000?

---

## 🚀 Production Deployment

When ready to deploy:
1. Build frontend: `npm run build` in client/
2. Build backend: `npm run build` in backend/
3. Start backend: `npm start` (uses compiled JS)
4. Host frontend build/ folder
5. Update environment variables for production
6. Use production MongoDB URI (Atlas)
7. Update FRONTEND_URL to production domain

---

**You're all set! Open http://localhost:3000 and start testing! 🎉**
