# AI-Powered Recruitment Tool - Backend Setup

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/recruitment-tool?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "recruiter"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Job Endpoints

#### Create Job
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "requiredSkills": ["React", "TypeScript", "Node.js"]
}
```

#### Get All Jobs
```http
GET /api/jobs
```

#### Get Job by ID
```http
GET /api/jobs/:id
```

#### Update Job
```http
PUT /api/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Lead React Developer",
  "description": "Updated description",
  "requiredSkills": ["React", "TypeScript", "Node.js", "MongoDB"]
}
```

#### Delete Job
```http
DELETE /api/jobs/:id
Authorization: Bearer <token>
```

### Candidate Endpoints

#### Upload Resume
```http
POST /api/candidates/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "resume": <file>,
  "jobId": "job_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "candidate": {
    "_id": "candidate_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "123-456-7890",
    "skills": ["React", "TypeScript"],
    "education": [
      {
        "degree": "Bachelor",
        "field": "Computer Science",
        "institution": "MIT"
      }
    ],
    "experience": [
      {
        "title": "Frontend Developer",
        "company": "Tech Corp",
        "duration": "2 years"
      }
    ],
    "matchScore": 85,
    "job": "job_id",
    "resumeFile": "./uploads/1234567890-resume.pdf"
  }
}
```

#### Get Candidates for Job
```http
GET /api/candidates/:jobId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "totalCandidates": 5,
  "averageScore": 78,
  "topCandidates": [...],
  "allCandidates": [...]
}
```

#### Get Candidate Details
```http
GET /api/candidates/detail/:id
Authorization: Bearer <token>
```

## Database Models

### User
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  role: "recruiter" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Job
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  requiredSkills: string[],
  recruiter: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Candidate
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string,
  skills: string[],
  education: [{
    degree: string,
    field: string,
    institution: string
  }],
  experience: [{
    title: string,
    company: string,
    duration: string
  }],
  resumeFile: string,
  job: ObjectId (ref: Job),
  matchScore: number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

## Available npm Scripts

- `npm run dev` - Start development server with hot reload (uses ts-node)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run watch` - Watch for TypeScript changes and compile

## Error Handling

All errors return a JSON response with:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## File Upload Limits

- Max file size: 5MB (configurable via MAX_FILE_SIZE)
- Allowed formats: PDF, DOCX
- Upload directory: `./uploads`

## Security Notes

- Passwords are hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire after 7 days (configurable)
- All protected routes require valid Bearer token
- File uploads are validated for MIME type
- CORS is enabled for frontend access

## MongoDB Setup

### Local Development
```bash
# Using MongoDB Community Edition
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### MongoDB Atlas (Cloud)
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Create database user
3. Get connection string
4. Add IP address to whitelist
5. Update MONGO_URI in .env

## Testing

Example request using curl:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Create job
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "description": "Great opportunity",
    "requiredSkills": ["JavaScript", "React"]
  }'

# Upload resume
curl -X POST http://localhost:5000/api/candidates/upload \
  -H "Authorization: Bearer <token>" \
  -F "resume=@resume.pdf" \
  -F "jobId=<job_id>"
```
