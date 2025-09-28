# CollabWork Platform

A comprehensive job management platform designed to streamline job discovery, curation, and distribution across multiple channels and communities.

## 🎯 Overview

CollabWork serves as the central hub for managing job opportunities, connecting job seekers with curated positions while providing powerful tools for administrators to manage and distribute listings across various platforms and communities.

## ✨ Features

### Job Discovery & Management
- **Smart Search**: Advanced filtering by location, job type, skills, and more
- **Multi-status Workflow**: Track jobs through suggested → approved → live → closed lifecycle
- **Batch Operations**: Bulk approve, archive, or manage multiple listings
- **Real-time Updates**: Live synchronization with backend systems

### Community Integration
- **Multi-brand Support**: Distribute jobs across different community brands
- **Priority Queuing**: Manage job visibility and promotion priority
- **Brand-specific Filtering**: View and manage jobs by community/brand

### Analytics & Insights
- **Engagement Tracking**: Monitor job listing performance
- **Click Analytics**: Track user interaction with job postings
- **Brand Performance**: Analyze effectiveness across different communities

### User Experience
- **Modern UI**: Clean, intuitive interface built with Next.js and Tailwind CSS
- **Dark Mode**: Full theme support with system preference detection
- **Responsive Design**: Optimized for all device sizes
- **Accessible**: WCAG compliant components and navigation

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React hooks and context
- **Backend**: Xano (no-code backend platform)
- **Authentication**: JWT-based with secure cookie storage
- **Deployment**: Optimized for Vercel

## 🏗 Architecture

### Backend Architecture
This application uses a decoupled architecture with **Xano as the backend service layer**. Unlike traditional Next.js applications that use API routes, all backend logic is handled by Xano's platform at `api.collabwork.com`.

#### Key Design Decisions:
- **No Next.js API Routes**: Components communicate directly with Xano endpoints via the service layer
- **Service Layer Pattern**: All API calls go through `lib/xano.ts` which provides a clean interface to the backend
- **Direct API Integration**: The frontend makes authenticated requests directly to Xano's RESTful APIs
- **Real-time Data**: All data operations happen server-side in Xano with immediate consistency

#### Xano API Structure:
The backend is organized in the **😊 Sept2025 MicroApp** API group, containing 44 endpoints across three main namespaces:

1. **Ashley Endpoints** (`/ashley/*`):
   - Job discovery and management
   - Bulk operations
   - Priority queue management
   - Community assignments

2. **Morning Brew Endpoints** (`/morningbrew/*`):
   - Curated job operations
   - Brand-specific filtering
   - Click tracking and analytics
   - Newsletter generation

3. **Shared Endpoints**:
   - Authentication (`/admin/auth/*`)
   - Community listings (`/communities`)
   - Public job boards (`/public/jobs/*`)
   - Tracking links (`/t/{token}`)

This architecture provides:
- **Scalability**: Backend scales independently from frontend
- **Security**: All business logic protected server-side
- **Performance**: Optimized database queries and caching
- **Flexibility**: Easy to add new endpoints without frontend deploys

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd ashleyfrontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
ashleyfrontend/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Main dashboard interface
│   ├── auth/              # Authentication flows
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── data-table/       # Advanced table components
│   └── job-table-*.tsx   # Job-specific tables
├── lib/                   # Utilities and helpers
│   ├── xano.ts           # API client configuration
│   ├── job-filters.ts    # Filter logic
│   └── utils.ts          # Shared utilities
└── styles/               # Global styles and themes
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 🚢 Deployment

The application is configured for seamless deployment on Vercel:

```bash
npm run build
vercel --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Security Features

- **Authentication**: Secure JWT token management
- **Authorization**: Role-based access control
- **Data Protection**: Input sanitization and validation
- **API Security**: Rate limiting and CORS configuration
- **Cookie Security**: httpOnly, secure, sameSite settings

## 📊 API Integration

The platform integrates with Xano's robust API infrastructure:

### Core Endpoints
- **Authentication**: `/auth/login`, `/auth/logout`
- **Jobs**: Full CRUD operations at `/jobs/*`
- **Communities**: Brand management at `/communities/*`
- **Analytics**: Performance data at `/analytics/*`

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for CollabWork.

---