# TimeTrack - AI-Powered Daily Time Tracking & Analytics Dashboard

A comprehensive time tracking application that helps you monitor and analyze how you spend your time each day. Built with modern web technologies and featuring intelligent analytics with beautiful visualizations.

## 🌟 Features

### 🔐 User Authentication
- Secure Google OAuth authentication
- Protected routes for authenticated users only
- Seamless login/logout experience

### 📊 Activity Logging System
- **Date Selection**: Pick any date to log activities
- **Multiple Activities**: Add unlimited activities per day
- **Categorization**: Organize activities into predefined categories:
  - Work
  - Study
  - Sleep
  - Entertainment
  - Exercise
  - Other
- **Smart Time Tracking**: 
  - Track duration in minutes
  - Auto-calculated remaining time for the day
  - 24-hour (1440 minute) daily limit enforcement
  - Real-time validation to prevent exceeding daily limit

### ✏️ Full CRUD Operations
- **Create**: Add new activities with name, category, and duration
- **Read**: View all activities for selected date
- **Update**: Edit existing activity details
- **Delete**: Remove activities as needed
- Real-time updates reflected immediately

### 📈 Analytics Dashboard
- **Summary Cards**:
  - Total time spent (hours and minutes)
  - Number of activities logged
  - Category count
- **Interactive Visualizations**:
  - Pie chart showing time distribution by category
  - Bar chart displaying individual activity durations
  - Category breakdown with progress bars
- **Smart Empty States**: Beautiful "No Data Available" screen when no activities exist

### 🎨 Modern UI/UX
- Clean, professional design with gradient accents
- Mobile-responsive layout
- Smooth animations and transitions
- Hover effects and interactive elements
- Beautiful color palette (Indigo/Purple theme)
- Lucide React icons throughout

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **React Router** - Client-side routing
- **date-fns** - Date manipulation utilities
- **Lucide React** - Beautiful icon library

### Backend
- **Cloudflare Workers** - Serverless edge computing
- **Hono** - Fast web framework for Workers
- **Cloudflare D1** - SQLite-based database
- **Mocha Users Service** - Authentication SDK
- **Zod** - Schema validation

### Authentication
- Google OAuth via Mocha Users Service
- Secure session management
- HTTP-only cookies

## 📁 Project Structure

```
src/
├── react-app/
│   ├── components/
│   │   ├── ActivityForm.tsx      # Form for adding/editing activities
│   │   ├── ActivityList.tsx      # List display of activities
│   │   ├── Header.tsx            # App header with user info
│   │   └── ProtectedRoute.tsx    # Route protection wrapper
│   ├── pages/
│   │   ├── ActivityLog.tsx       # Main activity logging page
│   │   ├── Analytics.tsx         # Analytics dashboard page
│   │   ├── AuthCallback.tsx      # OAuth callback handler
│   │   └── Landing.tsx           # Landing/login page
│   ├── App.tsx                   # Root component with routing
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles
├── shared/
│   └── types.ts                  # Shared TypeScript types
└── worker/
    └── index.ts                  # Hono API routes
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Mocha account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd timetrack
```

2. Install dependencies:
```bash
npm install
```

3. The app uses Mocha's built-in authentication service. Secrets are already configured:
   - `MOCHA_USERS_SERVICE_API_KEY`
   - `MOCHA_USERS_SERVICE_API_URL`

4. Run database migrations:
```bash
# Migrations are automatically applied when you run the app
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to the URL shown in the terminal

## 📱 Usage

### Logging Activities

1. **Sign In**: Click "Sign in with Google" on the landing page
2. **Select Date**: Choose a date from the date picker
3. **Add Activity**: 
   - Click "Add Activity" button
   - Enter activity name (e.g., "Team Meeting")
   - Select category (e.g., "Work")
   - Enter duration in minutes
   - Click "Add Activity"
4. **Manage Activities**:
   - Hover over an activity to see edit/delete buttons
   - Click edit icon to modify
   - Click delete icon to remove

### Viewing Analytics

1. Log at least one activity for a date
2. Click the "Analyze" button (enabled when total minutes > 0)
3. View comprehensive analytics including:
   - Total time summary
   - Pie chart of time by category
   - Bar chart of activity durations
   - Detailed category breakdown

### Time Limit Management

- Each day has a maximum of 1440 minutes (24 hours)
- The app displays remaining available minutes
- Adding/editing activities validates against this limit
- Helpful error messages if limit would be exceeded

## 🎯 Key Functionality

### Database Schema

```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  activity_name TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

- `GET /api/oauth/google/redirect_url` - Get OAuth login URL
- `POST /api/sessions` - Exchange code for session token
- `GET /api/users/me` - Get current user
- `GET /api/logout` - Logout user
- `GET /api/activities/:date` - Get activities for date
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/analytics/:date` - Get analytics for date

## 🎨 Design Philosophy

The app features a modern, clean design with:
- Gradient backgrounds (indigo to purple theme)
- Card-based layouts with shadows and borders
- Smooth hover effects and transitions
- Responsive grid layouts
- Accessible color contrasts
- Professional typography

## 🔮 Future Improvements

- [ ] Weekly and monthly analytics views
- [ ] Export data to CSV/PDF
- [ ] Custom activity categories
- [ ] Activity templates for common tasks
- [ ] Time tracking goals and targets
- [ ] Comparison across multiple dates
- [ ] Dark mode support
- [ ] Activity tags and notes
- [ ] Search and filter activities
- [ ] Calendar view of all logged days

## 📸 Screenshots

_Screenshots will be added here once the app is deployed_

## 🔗 Links

- **Live Demo**: [Your deployment URL]
- **Video Walkthrough**: [Your video URL]
- **Documentation**: This README

## 👤 Author

Built with ❤️ using Mocha

## 📄 License

This project is open source and available under the MIT License.

---

**Note**: This app uses Mocha's authentication service and Cloudflare infrastructure. Make sure you have the necessary credentials configured before deploying to production.
