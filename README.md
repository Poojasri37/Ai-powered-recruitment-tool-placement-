# AI-Powered Recruitment Tool

A full-stack recruitment platform with AI-powered resume parsing and candidate matching. Built with React, Node.js, Express, MongoDB, and TanStack Query.

## 📋 Features

### Phase 1 Implementation
- **User Authentication**: JWT-based recruiter registration and login
- **Job Management**: Create, update, delete, and list job postings
- **Resume Parsing**: Upload and parse PDF/DOCX resumes with automatic skill extraction
- **AI Matching**: Keyword-based matching to generate candidate match scores (0-100%)
- **Dashboard**: 
  - View total candidates per job
  - See average match scores
  - List top 3 matching candidates
  - Manage job postings

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **pdf-parse** - PDF parsing
- **Mammoth** - DOCX parsing

## 📁 Project Structure

```
AI-Powered Recruitment Tool/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Job.ts
│   │   │   └── Candidate.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── jobs.ts
│   │   │   └── candidates.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   ├── parseResume.ts
│   │   │   └── matching.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── JobFormPage.tsx
│   │   │   ├── CandidateListPage.tsx
│   │   │   └── CandidateDetailPage.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── CandidateList.tsx
│   │   │   └── ResumeUpload.tsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/recruitment-tool
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR=./uploads
   ```

3. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   
   App opens at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new recruiter
- `POST /api/auth/login` - Login recruiter
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `POST /api/jobs` - Create a job (protected)
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (protected)
- `DELETE /api/jobs/:id` - Delete job (protected)

### Candidates
- `POST /api/candidates/upload` - Upload and parse resume (protected)
- `GET /api/candidates/:jobId` - List candidates for a job (protected)
- `GET /api/candidates/detail/:id` - Get candidate details (protected)

## 🔐 Authentication

The app uses JWT tokens stored in localStorage. All protected routes require a valid token in the Authorization header:
```
Authorization: Bearer <token>
```

## 📝 Resume Parsing

Supported formats:
- **PDF** - Extracted using pdf-parse
- **DOCX** - Extracted using mammoth

Extraction includes:
- Candidate name and contact info
- Skills (matched against common tech keywords)
- Education details
- Work experience
- Match score based on job requirements

## 🤖 Matching Algorithm

The matching algorithm uses keyword overlap:
1. Extracts skills from uploaded resume
2. Compares with required skills for the job
3. Calculates score: `(matched_skills / required_skills) × 100%`
4. Scores range from 0-100%

## 🔄 Workflow

1. **Register/Login** → Get JWT token
2. **Create Job** → Define title, description, and required skills
3. **Upload Resume** → Recruiter or candidate uploads PDF/DOCX
4. **View Candidates** → See parsed resume data and match scores
5. **Review Details** → Check candidate's full profile
6. **Download Resume** → Access original resume file

## 🚧 Next Steps (Future Phases)

- Advanced AI matching using embeddings
- Candidate scoring with ML models
- Email notifications
- Candidate portal for self-submission
- Interview scheduling
- Bulk operations
- Analytics and reporting
- Multiple file format support

## 🛠️ Development Commands

### Backend
```bash
npm run dev      # Start dev server with ts-node
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm run watch    # Watch for changes
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
```

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Verify MONGO_URI in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure username/password are correct

**Port Already in Use**
- Backend: Change PORT in `.env`
- Frontend: Use `npm run dev -- --port 3001`

**CORS Errors**
- Ensure backend is running on port 5000
- Check frontend is on port 3000
- CORS is enabled in Express middleware

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Built with ❤️ for the recruitment industry**
