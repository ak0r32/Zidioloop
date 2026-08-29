# LOOP — Close the loop on customer feedback

A production-quality multi-tenant SaaS application for collecting, analyzing, and acting on customer feedback with AI-powered insights.

## 🎯 Features — Milestone 1 (Foundation)

- ✅ **Authentication**: Secure signup/login with bcrypt password hashing
- ✅ **Workspaces**: Multi-tenant isolation with workspace-scoped data
- ✅ **RBAC**: Three roles (ADMIN, ANALYST, VIEWER) with server-side enforcement
- ✅ **Feedback CRUD**: Create, read, update, delete feedback
- ✅ **Database**: PostgreSQL with Prisma ORM and proper migrations
- ✅ **Dashboard**: Professional SaaS UI with Tailwind CSS
- ✅ **Demo Data**: 120+ realistic feedback items with themes

## 🏗️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth with credentials provider
- **Validation**: Zod
- **AI**: Anthropic Claude (integrated in M3)
- **Charts**: Recharts (integrated in M2)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)

### Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Configure environment**:

Create a `.env` file with your database URL and secrets (see `.env.example`).

3. **Set up database**:

```bash
npm run db:push
```

This creates tables and indexes in your PostgreSQL database.

4. **Seed demo data**:

```bash
npm run db:seed
```

This creates a demo workspace with 3 users, 70+ themes, and 120+ realistic feedback items.

5. **Start the dev server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding, log in with:

| Role   | Email              | Password  |
|--------|-------------------|-----------|
| Admin  | admin@demo.loop   | demo1234  |
| Analyst| analyst@demo.loop | demo1234  |
| Viewer | viewer@demo.loop  | demo1234  |

## 📁 Project Structure

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── dashboard/
├── feedback/
├── themes/
├── trends/
├── ask-loop/
├── reports/
├── settings/
├── api/
│   ├── auth/
│   └── feedback/
└── globals.css

src/
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── session.ts        # Session helpers
│   ├── workspace.ts      # Workspace creation
│   ├── rbac.ts           # Role-based access control
│   └── validation.ts     # Zod schemas
└── types/
    └── next-auth.d.ts    # Auth type extensions

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Seeding script

middleware.ts            # NextAuth route protection
```

## 🔐 Security

- **Multi-tenancy**: Every query is scoped to `workspaceId` from authenticated session
- **RBAC**: Server-side enforcement prevents unauthorized access
- **Secrets**: API keys stay server-side, never exposed to browser
- **Password**: Hashed with bcryptjs, never stored plaintext

## 🧪 Milestone 1 Testing Checklist

- [ ] Signup creates workspace + admin user + seed data
- [ ] Login works with demo credentials
- [ ] Dashboard shows feedback counts and recent items
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Workspace A data doesn't leak to Workspace B
- [ ] API enforces role-based permissions (403 for unauthorized)
- [ ] Feedback CRUD works (create, read, update, delete)
- [ ] Database migrations applied successfully
- [ ] 120+ feedback items seeded with themes

## 📋 Upcoming Milestones

- **M2**: CSV upload, simulated channels, feedback inbox, filters, pagination, charts
- **M3**: AI classification, themes & trends, semantic search, Ask LOOP, embeddings
- **M4**: VoC reports, export, accessibility, responsive design, production deployment

## 🛠️ Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:push          # Apply schema to database
npm run db:seed          # Seed demo data
npm run db:reset         # Reset database (warning: destructive)
npm run prisma:generate  # Generate Prisma client
```

## 📖 Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret key for JWT signing (min 32 chars production)
- `NEXTAUTH_URL`: Application URL
- `ANTHROPIC_API_KEY`: Claude API key

## 📚 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ for modern customer feedback intelligence.**
