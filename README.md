# Lead Management System

A full-stack lead management system with JWT authentication, built with Next.js and Flask.

## Features

### Authentication
- JWT-based authentication
- Secure login with email/password
- Token stored in localStorage
- Protected routes with middleware

### Lead Management
- View all leads in a paginated table
- Add new leads with form validation
- Edit existing leads with optimistic UI updates
- Delete leads with confirmation
- Status tracking (New, In Progress, Converted)
- Responsive design with Tailwind CSS

### Advanced Features
- **Search & Filter**: Search by name, email, or phone; filter by status
- **Column Sorting**: Sort by name, email, status, or creation date (ascending/descending)
- **CSV Import/Export**: Bulk import leads from CSV files or export all leads
- **Notes & Attachments**: Add, view, and delete notes for each lead
- **Toast Notifications**: Real-time feedback for all actions
- **Optimistic UI**: Instant feedback with automatic rollback on errors

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Client-side routing

### Backend
- Python 3.13
- Flask
- PyJWT for authentication
- Flask-CORS for cross-origin requests
- In-memory data storage

## Project Structure
```
.
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── app/
│   │   ├── page.tsx       # Home (redirects to login)
│   │   ├── login/         # Login page
│   │   ├── leads/         # Leads management page
│   │   └── lib/           # Utilities (auth, api)
│   ├── package.json
│   └── tailwind.config.ts
└── README.md
```

## Quick Start

### Option 1: Using Scripts (Recommended)

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Backend runs on http://localhost:5001

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You'll be redirected to the leads page

### Managing Leads
- **Search**: Type in the search box to filter by name, email, or phone
- **Filter**: Use the status dropdown to filter by lead status
- **Sort**: Click column headers to sort (name, email, status, created date)
- **Add**: Click "Add New Lead" to create a new lead
- **Edit**: Click "Edit" on any lead to modify it
- **Notes**: Click "Notes" to add/view notes for a lead
- **Delete**: Click "Delete" to remove a lead (with confirmation)

### Import/Export
- **Export**: Click "Export CSV" to download all leads as a CSV file
- **Import**: Click "Import CSV" and select a CSV file (see `sample-leads.csv` for format)
  - Required columns: name, email
  - Optional columns: phone, status

### CSV Format
```csv
name,email,phone,status
John Doe,john@example.com,555-0101,New
Jane Smith,jane@example.com,555-0102,In Progress
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and receive JWT token
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: `{ "token": "string", "email": "string" }`

### Leads (Protected)
- `GET /api/leads` - Get paginated and filtered leads
  - Headers: `Authorization: Bearer <token>`
  - Query params: `page`, `per_page`, `q` (search), `status`, `sort_by`, `sort_dir`
  - Returns: `{ "leads": [], "total": number, "page": number, "per_page": number, "total_pages": number }`

- `POST /api/leads` - Create new lead
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "email": "string", "phone": "string", "status": "New" }`
  - Returns: Created lead object

- `PUT /api/leads/:id` - Update lead
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "email": "string", "phone": "string", "status": "string" }`
  - Returns: Updated lead object

- `DELETE /api/leads/:id` - Delete lead
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "message": "Lead deleted" }`

- `GET /api/leads/export` - Export all leads as CSV
  - Headers: `Authorization: Bearer <token>`
  - Returns: CSV file download

- `POST /api/leads/import` - Import leads from CSV
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with 'file' field (CSV file)
  - Returns: `{ "message": "string", "imported": number, "errors": [] }`

### Notes (Protected)
- `GET /api/leads/:id/notes` - Get all notes for a lead
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "notes": [] }`

- `POST /api/leads/:id/notes` - Add note to a lead
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "content": "string" }`
  - Returns: Created note object

- `DELETE /api/leads/:id/notes/:note_id` - Delete a note
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "message": "Note deleted" }`

## Security Notes

- JWT tokens expire after 24 hours
- All lead endpoints require valid JWT token
- CORS is enabled for development (configure for production)
- Change `SECRET_KEY` in backend/.env for production use

## Future Enhancements

- Database integration (SQLite/PostgreSQL)
- User registration
- Password hashing
- Role-based access control
- Lead search and filtering
- Export leads to CSV
- Email notifications
- Activity logging
