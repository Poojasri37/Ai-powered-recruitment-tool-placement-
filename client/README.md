# AI-Powered Recruitment Tool - Frontend Setup

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App opens at `http://localhost:3000`

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.tsx          # Authentication (login/register)
│   ├── DashboardPage.tsx       # Main dashboard with job listings
│   ├── JobFormPage.tsx         # Create/edit job postings
│   ├── CandidateListPage.tsx   # View candidates for a job
│   └── CandidateDetailPage.tsx # View candidate profile
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── DashboardStats.tsx      # Statistics cards
│   ├── JobCard.tsx             # Job card component
│   ├── CandidateList.tsx       # Candidates table
│   └── ResumeUpload.tsx        # Resume upload form
├── styles/
│   └── globals.css             # Global Tailwind styles
├── App.tsx                      # Main app router
└── main.tsx                     # React entry point
```

## Environment Setup

The frontend communicates with backend at `http://localhost:5000`. Make sure:
- Backend server is running
- CORS is enabled (it is by default)
- JWT token is stored in localStorage after login

## Pages & Features

### 1. LoginPage
- Register new recruiters
- Login with email/password
- JWT token stored in localStorage
- Redirects to dashboard on success

### 2. DashboardPage
- Shows statistics (total jobs, candidates, avg match)
- Lists all job postings
- Quick access to create new job
- Delete job postings

### 3. JobFormPage
- Create new job postings
- Input: title, description, required skills
- Skills are comma-separated and converted to array
- Redirects to dashboard on success

### 4. CandidateListPage
- Shows job details and required skills
- Lists all candidates sorted by match score
- Upload resume form
- Shows match score and candidate ranking

### 5. CandidateDetailPage
- Candidate name, email, phone
- Match score display with progress bar
- Skills, education, experience sections
- Download resume link

## Components

### Header
- Shows user name
- Logout button
- Navigation to dashboard

### DashboardStats
- Total jobs count
- Total candidates count
- Average match score

### JobCard
- Job title and description
- Required skills tags
- View candidates button
- Delete job button

### CandidateList
- Sortable by match score
- Match score progress bar
- Email and name display
- View details link

### ResumeUpload
- Drag-and-drop file upload
- PDF and DOCX support
- File size limit: 5MB
- Success/error messages

## Available npm Scripts

```bash
npm run dev     # Start Vite dev server (port 3000)
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint (if configured)
```

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for all protected routes
5. On logout, token is removed from localStorage

## API Integration

Frontend makes requests to:
- `http://localhost:5000/api/auth/*` - Authentication
- `http://localhost:5000/api/jobs/*` - Job management
- `http://localhost:5000/api/candidates/*` - Candidate management

All requests include:
```javascript
{
  method: 'POST|GET|PUT|DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}
```

## State Management

Currently uses React hooks and component state. Features:
- `useState` for local state
- `useEffect` for data fetching
- localStorage for persistence

### Future Enhancement
Can be upgraded to TanStack Query or Redux Toolkit for:
- Caching
- Automatic refetching
- Optimistic updates
- Error boundaries

## Styling

Uses **Tailwind CSS** v3 with:
- Responsive design (mobile-first)
- Utility-first approach
- Custom globals.css for additional styles
- lucide-react icons

## File Upload

Resume upload features:
- Accepts PDF and DOCX files
- Max 5MB file size
- Validates MIME type on client and server
- Shows upload progress
- Success/error notifications

## Error Handling

- Network errors display user-friendly messages
- Form validation on client side
- API error responses shown to user
- Unauthorized (401) redirects to login

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant updates when you save files - no full page refresh needed.

### TypeScript
All components are typed for better IDE support and error catching.

### React Router
Routes are configured in `App.tsx`:
- `/` - Login (public)
- `/dashboard` - Main dashboard (protected)
- `/job-form` - Create job (protected)
- `/candidates/:jobId` - View candidates (protected)
- `/candidate/:candidateId` - Candidate details (protected)

## Troubleshooting

**Port 3000 already in use**
```bash
npm run dev -- --port 3001
```

**API connection errors**
- Check backend is running on port 5000
- Verify CORS is enabled
- Check browser console for detailed errors

**localStorage not working**
- Ensure browser allows localStorage
- Check private/incognito mode doesn't restrict it

**Tailwind styles not applied**
- Run `npm install` to ensure all dependencies installed
- Restart dev server
- Check tailwind.config.js is correct

## Performance Optimization

### Code Splitting
Vite automatically code-splits dynamic imports:
```javascript
const Component = React.lazy(() => import('./Component'))
```

### Image Optimization
Use lucide-react for icons (lightweight SVGs).

### Network
- Resume uploads are shown with progress
- Candidate lists paginated (future)
- Lazy loading for candidates (future)

## Next Steps

- Add TanStack Query for better data fetching
- Implement candidates pagination
- Add bulk operations
- Candidate search/filtering
- Email notifications
- Calendar for interviews
