# Quick Test - Candidate Apply → View Applications → Schedule Interview

## Prerequisites
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3001
- MongoDB connected

## Test Flow

### 1. Candidate Applies for Job
1. Login as candidate
2. Go to "Browse Jobs"
3. Find a job and click "Apply"
4. Upload a PDF or DOCX resume
5. **Expected**: Application submitted successfully

### 2. Recruiter Views Applications
1. Login as recruiter
2. Go to Dashboard
3. Find the job and click "View Applications"
4. **URL**: `/job-applications/:jobId`
5. **Expected**: See the candidate who applied in the list with match score

### 3. Recruiter Views Application Details
1. Click "View Details" on a candidate
2. **URL**: `/application/:appId`
3. **Expected**: See candidate info, skills, match score, and **"Schedule Interview" button**

### 4. Recruiter Schedules Interview
1. Click "Schedule Interview"
2. Select future date and time
3. Click "Schedule Interview"
4. **Expected**: Success message, status changes to "Interview Scheduled"

## Bug Fixes Applied
- Fixed JobApplicationsPage to read `allApplications` instead of `applications` from API response
- Backend was correctly returning `allApplications` in response
- Application model defaults to status `'applied'`
- ApplicationDetailPage button renders when status is `'applied'`

