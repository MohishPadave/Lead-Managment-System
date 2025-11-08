# 🚀 Lead Management System

A professional full-stack lead management system with advanced features including mentions, notifications, watchers, and activity tracking.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-yellow)

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


## 📸 Screenshots

### Light Mode
![Lead Management Dashboard](https://via.placeholder.com/800x400/ffffff/000000?text=Lead+Management+Dashboard)

### Dark Mode
![Dark Mode Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=Dark+Mode+Dashboard)

## ✨ Key Features

### Core Functionality
- ✅ **JWT Authentication** - Secure login with multiple user support
- ✅ **Lead Management** - Full CRUD operations (Create, Read, Update, Delete)
- ✅ **Notes System** - Add notes to leads with rich text support
- ✅ **CSV Import/Export** - Bulk operations with validation
- ✅ **Search & Filter** - Real-time search by name, email, or phone
- ✅ **Column Sorting** - Sort by any column (ascending/descending)
- ✅ **Pagination** - Handle large datasets efficiently

### Advanced Features
- 🎯 **@Mentions** - Tag team members in notes (e.g., @mohan)
- 🔔 **Notifications** - In-app notification system for mentions and updates
- 👥 **Watchers** - Follow leads for automatic updates
- 📊 **Activity Timeline** - Complete audit trail of all actions
- ✅ **Read Receipts** - Track who's seen notes
- 🌓 **Dark Mode** - Beautiful dark theme with smooth transitions
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop

### UI/UX
- 🎨 **Professional Design** - Modern, clean interface
- 🌈 **Tailwind CSS** - Utility-first styling
- ⚡ **Optimistic UI** - Instant feedback with automatic rollback
- 🎭 **Toast Notifications** - Real-time feedback for all actions
- 🔄 **Smooth Animations** - Polished transitions and effects

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

### Backend
- **Framework**: Flask 3.0
- **Language**: Python 3.11+
- **Authentication**: JWT (PyJWT)
- **CORS**: Flask-CORS
- **Data Storage**: In-memory (easily adaptable to PostgreSQL/MySQL)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/MohishPadave/Lead-Managment-System.git
cd Lead-Managment-System
```

2. **Backend Setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Backend runs on http://localhost:5001

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

### Default Login Credentials
- **Admin**: admin@example.com / admin123
- **Mohan**: mohan@example.com / mohan123
- **Ravi**: ravi@example.com / ravi123

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deploy to Vercel
- [Advanced Features](ADVANCED_FEATURES_IMPLEMENTED.md) - Mentions, Watchers, Activities
- [API Documentation](API_TESTING.md) - Complete API reference
- [Features List](FEATURES.md) - Detailed feature breakdown

## 🎯 Usage Examples

### Mentions
```
Add a note: "Please review this lead @mohan"
→ Mohan receives a notification
→ Click notification to view the lead
```

### Watchers
```
Click "Watch" on a lead
→ Receive notifications for all updates
→ Status changes, new notes, etc.
```

### Activity Timeline
```
View complete history of a lead:
- Who created it
- Status changes
- Notes added
- Files uploaded
```

## 🔐 Security Features

- JWT token-based authentication
- Token expiration (24 hours)
- Protected API routes
- CORS configuration
- Input validation
- XSS protection

## 📊 Database Schema

### Users
```python
{
  'id': int,
  'email': str,
  'password': str,
  'username': str,
  'name': str
}
```

### Leads
```python
{
  'id': int,
  'name': str,
  'email': str,
  'phone': str,
  'status': str,  # 'New', 'In Progress', 'Converted'
  'created_at': str,
  'watchers': [user_ids]
}
```

### Notes
```python
{
  'id': int,
  'lead_id': int,
  'user_id': int,
  'user_name': str,
  'content': str,
  'created_at': str
}
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done!)

2. **Deploy Backend**
   - Go to https://vercel.com/new
   - Import repository
   - Root directory: `backend`
   - Add environment variables

3. **Deploy Frontend**
   - Go to https://vercel.com/new
   - Import same repository
   - Root directory: `frontend`
   - Add environment variable: `NEXT_PUBLIC_API_URL`

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python -m pytest
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing
1. Login with test credentials
2. Create a lead
3. Add note with @mention
4. Check notifications
5. View activity timeline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohish Padave**
- GitHub: [@MohishPadave](https://github.com/MohishPadave)
- Repository: [Lead-Managment-System](https://github.com/MohishPadave/Lead-Managment-System)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Flask team for the lightweight backend
- Tailwind CSS for the utility-first CSS framework
- Vercel for easy deployment

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation files
- Review the code comments

## 🗺️ Roadmap

- [ ] Database integration (PostgreSQL/MySQL)
- [ ] Email notifications
- [ ] File attachments
- [ ] Advanced reporting
- [ ] Role-based access control
- [ ] API rate limiting
- [ ] Webhooks
- [ ] Mobile app

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

Made with ❤️ by Mohish Padave
