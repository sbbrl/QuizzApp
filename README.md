# Valentines Compatibility Quiz

A comprehensive web application for hosting Valentine's Day compatibility quiz events. Built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

### Admin Panel
- 🔐 **Secure Authentication** - Login with admin credentials
- 📝 **Template Builder** - Create custom quiz templates with:
  - Text answer questions
  - Multiple choice (radio buttons)
  - Dropdown selections
  - Required/optional questions
  - Reorder questions (up/down arrows)
- 🚀 **Session Management** - Start quiz sessions with:
  - Unique 4-character join codes
  - Lock/unlock controls
  - Time limits
  - Scheduled unlock times
- 📊 **Results & Analytics** - View participant responses and statistics

### Participant Experience
- 💕 **Easy Join** - Enter 4-character code to join
- ⏱️ **Time Tracking** - Optional time limits for quiz completion
- 🔒 **Session Status** - Automatic polling every 30 seconds when locked
- ⏰ **Countdown Timer** - Shows time remaining until scheduled unlock
- ✅ **Form Validation** - Required question enforcement

## Default Credentials

```
Username: admin
Password: leoadmin
```

**⚠️ Important:** Change these credentials in production!

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/sbbrl/QuizzApp.git
cd QuizzApp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the admin user:
```bash
npx tsx prisma/seed.ts
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sbbrl/QuizzApp)

### Manual Deployment

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Configure environment variables in Vercel:
   - `DATABASE_URL` - Your database connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

4. For the database, you have two options:

   **Option A: Vercel Postgres (Recommended for production)**
   - Go to your Vercel project → Storage → Create Database → Postgres
   - Vercel will automatically set the `DATABASE_URL` environment variable
   - Run migrations: `npx prisma db push`
   - Seed admin user: `npx tsx prisma/seed.ts`

   **Option B: SQLite (Development only)**
   - Keep using SQLite locally
   - Note: SQLite doesn't persist on Vercel due to ephemeral filesystem

5. Deploy! Vercel will automatically:
   - Build your application
   - Deploy to a production URL
   - Set up automatic deployments for future pushes

### Post-Deployment Setup

1. Access your admin panel at `https://your-app.vercel.app/admin`
2. Login with default credentials
3. Create your first quiz template
4. Start a session and share the join code!

## Using the Application

### For Hosts (Admin)

1. **Login** - Access `/admin` and login
2. **Create Template** - Build your quiz with custom questions
3. **Start Session** - Select a template and configure:
   - Optional time limit
   - Optional scheduled unlock time
   - Session status (locked/unlocked)
4. **Share Code** - Give participants the 4-character code
5. **Manage Session** - Lock/unlock, view responses, see statistics
6. **View Results** - See all participant responses and answers

### For Participants

1. **Join** - Go to `/join` and enter the 4-character code
2. **Wait** - If locked, page will poll every 30 seconds
3. **Enter Info** - Provide your name (and optional email)
4. **Take Quiz** - Answer all required questions
5. **Submit** - Review and submit your responses

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="file:./dev.db"  # For local SQLite
# DATABASE_URL="postgresql://..."  # For PostgreSQL in production

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"  # Change to production URL
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (dev) / PostgreSQL (production)
- **ORM:** Prisma 5
- **Authentication:** NextAuth.js
- **Deployment:** Vercel

## Project Structure

```
QuizzApp/
├── app/                  # Next.js app directory
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes
│   ├── join/            # Participant join page
│   └── quiz/            # Quiz taking interface
├── components/          # React components
├── lib/                 # Utilities and configurations
├── prisma/              # Database schema and migrations
└── types/               # TypeScript type definitions
```

## Database Schema

- **Admin** - Admin user accounts
- **Template** - Quiz templates with questions
- **Question** - Individual questions with type and options
- **Session** - Active quiz sessions with codes
- **Response** - Participant submissions with answers

## License

ISC License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

---

Made with 💕 for Valentine's Day events!
