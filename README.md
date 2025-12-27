# The Cage

**SIUE Mass Communications Equipment Checkout System**

> *Secure. Reserve. Create.*

The Cage is a production-ready Next.js application designed for the Broadcast Engineers and Mass Communications students at Southern Illinois University Edwardsville. It provides a modern, integrated platform for reserving, checking out, and managing broadcast production equipment with real-time availability tracking and comprehensive fee management.

## 🎬 Features

### Core Functionality

- **Digital Equipment Catalog**: Browse the full inventory of cameras, audio gear, lighting, and support equipment
- **Real-Time Availability**: Check equipment availability with calendar-based visualization powered by FullCalendar
- **Reservation System**: Reserve equipment in fixed 4-hour time blocks (09:00–13:00, 14:00–18:00)
- **Enforced Quotas**: 3-block weekly reservation limit per student to ensure equitable access
- **Mobile-Optimized Checkout**: QR code scanning interface for kiosk-based equipment checkout
- **Fee Management**: Track late returns, damage fees, and automatically block checkout for students with outstanding balances
- **White-Label Branding**: Centralized configuration for theming and institutional branding

### Technical Architecture

- **Snipe-IT Integration**: Bidirectional synchronization with open-source asset management backend
- **Shadow Database**: Local Prisma-managed database (SQLite dev/PostgreSQL prod) for reservation state and business logic
- **API Wall Pattern**: Service layer decoupling frontend from Snipe-IT API, enabling safe schema evolution
- **Authentication**: NextAuth v5 with mock credentials (dev) and Azure AD extensible design
- **Container Asset Strategy**: Kit handling via parent assets to simplify checkout workflows

## 🏗️ Architecture

### Database Design

**Snipe-IT** (source of truth for asset inventory)
- Hardware/asset catalog with custom fields
- User management with department mapping
- Asset checkout/checkin audit trail

**Shadow Database (Prisma)**
- `Reservation`: Tracks student booking requests with status (PENDING, CONFIRMED, CHECKED_OUT, COMPLETED, CANCELLED)
- `User`: Local user profiles with NextAuth integration and balance tracking
- `Fine`: Fee records for late returns or damage
- `Asset`: Local asset metadata for quick queries
- `Course`: Course codes for access control
- `UserCourse` & `AssetCourse`: Many-to-many relationships for course-based restrictions

## 📋 Project Structure

```
the-cage/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── reserve/           # POST /api/reserve - Create reservations
│   │   │   ├── availability/      # GET /api/availability - Query asset availability
│   │   │   ├── checkout/          # POST /api/checkout - Finalize checkout
│   │   │   └── admin/fines/       # POST/GET /api/admin/fines - Fee management
│   │   ├── catalog/               # Equipment catalog page
│   │   ├── calendar/              # Availability calendar page
│   │   ├── admin/scan/            # QR code checkout scanner
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout with auth
│   │   └── page.tsx               # Home/welcome page
│   ├── components/
│   │   ├── EquipmentCard.tsx      # Equipment display card
│   │   ├── ReservationCalendar.tsx # Time block selection
│   │   ├── calendar/
│   │   │   └── ResourceCalendar.tsx # FullCalendar integration
│   │   └── kiosk/
│   │       └── Scanner.tsx         # html5-qrcode scanner
│   ├── services/
│   │   ├── snipeit.ts            # Snipe-IT API client wrapper
│   │   ├── inventory-service.ts  # High-level inventory operations with caching
│   │   └── rules-engine.ts       # Business logic (quotas, restrictions)
│   ├── lib/
│   │   ├── availability-checker.ts # Reservation overlap detection
│   │   ├── inject-branding.ts      # CSS variable injection
│   │   ├── reservation-logic.ts    # Block validation and time slot logic
│   │   └── utils.ts                # Utility functions
│   ├── config/
│   │   └── branding.config.ts     # White-label configuration
│   └── auth/
│       └── auth-factory.ts        # NextAuth provider factory
├── prisma/
│   └── schema.prisma             # Database schema and migrations
├── docker/
│   └── apache/servername.conf    # Apache reverse proxy config
├── scripts/
│   └── seed-inventory.ts         # CSV import to Snipe-IT
├── docker-compose.yml            # Multi-container orchestration
├── Dockerfile                     # Multi-stage Next.js build
├── tailwind.config.ts            # CSS framework configuration
├── tsconfig.json                 # TypeScript configuration
├── jest.config.ts                # Test configuration
├── eslint.config.mjs             # Linting rules
├── next.config.ts                # Next.js configuration
├── components.json               # shadcn/ui configuration
├── postcss.config.mjs            # PostCSS configuration
├── package.json                  # Dependencies and scripts
├── .env                          # Environment variables (DO NOT COMMIT)
├── snipeit.env                   # Snipe-IT configuration
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.9.0 or higher (Alpine-compatible for Docker)
- **npm**: Included with Node.js
- **Docker & Docker Compose**: For containerized development and production deployment
- **Snipe-IT Instance**: Self-hosted or cloud-based (see [snipe-it.io](https://snipe-it.io))

### Local Development (Docker)

The fastest way to get started is with Docker Compose, which orchestrates all services:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd the-cage
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env with your Snipe-IT credentials
   # Required variables:
   # - SNIPEIT_API_URL: http://snipeit/api/v1 (for Docker) or https://your-snipeit.com/api/v1
   # - SNIPEIT_API_KEY: Your Snipe-IT API token
   ```

3. **Start all services:**
   ```bash
   docker compose up -d --build
   ```

   This launches:
   - **Next.js App**: http://localhost:3000
   - **Snipe-IT Admin**: http://localhost:8080
   - **MySQL Database**: localhost:3307 (internal: 3306)

4. **Verify all containers are running:**
   ```bash
   docker compose ps
   ```

5. **Access the application:**
   - Student portal: http://localhost:3000
   - Admin (Snipe-IT): http://localhost:8080

### Local Development (Node.js)

For direct Node.js development without Docker:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env.local for Next.js
   cat > .env.local << EOF
   DATABASE_URL="file:./dev.db"
   SNIPEIT_API_URL="http://localhost:8080/api/v1"
   SNIPEIT_API_KEY="<your-snipe-it-api-key>"
   NEXTAUTH_SECRET="$(openssl rand -base64 32)"
   NEXTAUTH_URL="http://localhost:3000"
   EOF
   ```

3. **Initialize the database:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 🔑 API Endpoints

All endpoints require an authenticated NextAuth session. The application uses email-based user identification (expandable to Snipe-IT user IDs).

### Reservations

**POST /api/reserve**
- Creates a new equipment reservation
- **Request Body:**
  ```json
  {
    "assetId": 1,
    "startTime": "2025-12-27T09:00:00Z",
    "endTime": "2025-12-27T13:00:00Z",
    "assetType": "Camera"
  }
  ```
- **Success Response:** 201 Created
  ```json
  {
    "id": "uuid-string",
    "status": "PENDING"
  }
  ```
- **Error Responses:**
  - 400: Invalid request format
  - 401: Unauthenticated
  - 403: Weekly quota exceeded (3 blocks)
  - 409: Time slot overlap

### Availability

**GET /api/availability**
- Merges Snipe-IT asset data with local reservation database
- **Query Parameters:**
  - `assetId` (required): Snipe-IT asset ID
  - `startDate` (optional): ISO 8601 date
  - `endDate` (optional): ISO 8601 date
- **Response:** 200 OK
  ```json
  {
    "assetId": 1,
    "name": "Canon XF100",
    "status": "Ready to Deploy",
    "reservations": [
      {
        "id": "uuid",
        "startTime": "2025-12-27T09:00:00Z",
        "endTime": "2025-12-27T13:00:00Z",
        "student": "john.doe@siue.edu"
      }
    ],
    "available": true
  }
  ```

### Checkout

**POST /api/checkout**
- Executes checkout workflow: validates reservation → calls Snipe-IT API → updates local status
- **Request Body:**
  ```json
  {
    "reservationId": "uuid-string"
  }
  ```
- **Success Response:** 201 Created
- **Error Responses:**
  - 401: Unauthenticated
  - 404: Reservation not found
  - 400: Invalid reservation status
  - 500: Snipe-IT API error

### Fees & Fines

**POST /api/admin/fines** (admin only)
- Issues a fine for late return or damage
- **Request Body:**
  ```json
  {
    "userId": "uuid",
    "reason": "Late return",
    "amount": 50.00
  }
  ```
- **Response:** 201 Created

**GET /api/admin/fines?userId=uuid** (admin only)
- Retrieves unpaid fines for a user
- **Response:** 200 OK
  ```json
  {
    "userId": "uuid",
    "fines": [
      {
        "id": "uuid",
        "reason": "Late return",
        "amount": 50.00,
        "dateIssued": "2025-12-27T10:00:00Z",
        "isPaid": false
      }
    ],
    "totalOwed": 50.00
  }
  ```

## 🔐 Authentication

The application uses **NextAuth v5** with a flexible provider factory pattern:

### Development (Mock Provider)
```typescript
// Uses hardcoded credentials for rapid development
Username: student@siue.edu
Password: password
```

### Production (Azure AD)
```typescript
// Extensible design supports Azure AD integration
// Update auth-factory.ts with tenant credentials:
const provider = new AzureADProvider({
  clientId: process.env.AZURE_AD_CLIENT_ID,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
  tenantId: process.env.AZURE_AD_TENANT_ID,
})
```

### Session Structure
```typescript
{
  user: {
    email: "student@siue.edu",
    name: "John Doe",
    image: string | null
  },
  expires: ISOString
}
```

## 🎨 Branding & Customization

All branding is centralized in `src/config/branding.config.ts`:

```typescript
export const BrandingConfig = {
  appName: "The Cage",
  institution: "SIUE Mass Communications",
  theme: {
    primary: "#e31837",      // SIUE Red
    secondary: "#1a1a1a",    // Dark
    accent: "#ffd700"        // Gold
  },
  logo: "/logo.svg",
  favicon: "/favicon.ico"
}
```

Colors are injected as CSS variables (`--primary-color`, `--secondary-color`, `--accent-color`) and used throughout Tailwind configs. This enables white-label deployment without code changes.

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Build Verification
```bash
npm run build
```

## 📦 Production Deployment

### Docker-Based Deployment

1. **Update environment variables for production:**
   ```bash
   # Update .env for production Snipe-IT
   SNIPEIT_API_URL="https://your-snipeit-instance.com/api/v1"
   SNIPEIT_API_KEY="<production-api-key>"
   
   # Switch to PostgreSQL
   DATABASE_URL="postgresql://user:password@db-host/the_cage_db"
   ```

2. **Build and deploy:**
   ```bash
   docker compose -f docker-compose.yml up -d --build
   ```

### Manual Deployment (Vercel/Railway/Heroku)

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect your hosting platform** and set environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `SNIPEIT_API_URL`
   - `SNIPEIT_API_KEY`
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production domain)

3. **Platform-specific deployment:**
   - **Vercel**: Connect GitHub repo → Auto-deploys
   - **Railway**: Use `railway up`
   - **Heroku**: Use `git push heroku main`

## 🔄 Database Management

### Local Development (SQLite)

SQLite database is created at `./dev.db` automatically on first migration:

```bash
# Apply migrations
npx prisma migrate dev

# View data in visual UI
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset
```

### Production (PostgreSQL)

1. **Set up PostgreSQL instance** (AWS RDS, DigitalOcean, self-hosted)
2. **Update `.env`:**
   ```
   DATABASE_URL="postgresql://user:password@host:5432/the_cage_db"
   ```
3. **Apply migrations:**
   ```bash
   npx prisma migrate deploy
   ```

## 🔧 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | N/A | Prisma database connection string |
| `SNIPEIT_API_URL` | ✅ | N/A | Snipe-IT API endpoint |
| `SNIPEIT_API_KEY` | ✅ | N/A | Snipe-IT API authentication token |
| `NEXTAUTH_SECRET` | ✅ | N/A | NextAuth session encryption key |
| `NEXTAUTH_URL` | ✅ | N/A | Application URL for callbacks |
| `APP_ENV` | | `production` | Application environment |
| `APP_DEBUG` | | `false` | Enable debug logging |
| `MYSQL_ROOT_PASSWORD` | | `snipe_root_password` | MySQL root password (Docker) |
| `MYSQL_DATABASE` | | `snipeit` | MySQL database name (Docker) |
| `MYSQL_USER` | | `snipe` | MySQL app user (Docker) |
| `MYSQL_PASSWORD` | | `snipe_password` | MySQL app password (Docker) |

## 📚 Tech Stack

### Frontend
- **Next.js 16.x** – React framework with App Router and Server Actions
- **React 19.2** – UI library
- **TypeScript 5.x** – Type-safe development
- **Tailwind CSS 4.x** – Utility-first styling
- **FullCalendar 6.x** – Advanced calendar UI (resource timeline view)
- **html5-qrcode 2.x** – Browser-based QR code scanning
- **Lucide React** – Icon library

### Backend
- **Next.js API Routes** – Serverless function endpoints
- **Prisma ORM 5.22** – Database abstraction and migrations
- **NextAuth v5** – Authentication & authorization
- **Axios** – HTTP client for Snipe-IT API
- **date-fns 2.x** – Date manipulation

### Database
- **SQLite** (development) – Zero-config, file-based
- **PostgreSQL** (production) – Scalable relational database
- **MySQL 5.7** (Snipe-IT container) – Asset management backend

### DevOps
- **Docker & Docker Compose** – Container orchestration
- **Node.js 20.9.0-Alpine** – Lightweight runtime
- **Next.js Build Cache** – Optimized multi-stage builds

### Testing & Quality
- **Jest 30.x** – Unit testing framework
- **@testing-library/react** – React component testing
- **ESLint 9** – Code linting
- **Babel React Compiler** – Performance optimization

## 🐛 Troubleshooting

### Common Issues

**Snipe-IT Connection Error**
```
Error: HTTP error! status: 500
```
- Verify `SNIPEIT_API_URL` is correct (includes `/api/v1` suffix)
- Check `SNIPEIT_API_KEY` is valid in Snipe-IT admin panel
- Ensure Snipe-IT container is running: `docker compose ps`

**Database Migration Failed**
```
Error: database is locked
```
- Close other connections to SQLite
- For Docker: `docker compose down && docker compose up -d --build`

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
- Kill existing process: `lsof -ti:3000 | xargs kill -9`
- Or change port in `docker-compose.yml`

**QR Code Scanner Not Working**
- Ensure HTTPS or localhost (camera access restricted)
- Allow browser permissions when prompted
- Check Scanner component is mounted in admin kiosk

## 📖 Documentation

- [EXECUTION_ROADMAP.md](./EXECUTION_ROADMAP.md) – Detailed project roadmap and phases
- [DEVELOPER_LOG.md](./DEVELOPER_LOG.md) – Implementation history and decisions
- [Prisma Documentation](https://www.prisma.io/docs) – Database ORM guide
- [Snipe-IT API Docs](https://snipe-it.readme.io) – Asset management API reference
- [NextAuth.js Documentation](https://next-auth.js.org) – Authentication setup
- [FullCalendar Documentation](https://fullcalendar.io/docs/react) – Calendar component guide

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions (camelCase for functions, PascalCase for components)
- Add JSDoc comments for public functions
- Keep components under 300 lines (split into smaller pieces if needed)

## 📝 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) file for details.

## 📧 Support

For issues, feature requests, or questions:
- GitHub Issues: Create an issue in the repository
- Email: [maintainer-email]
- Documentation: See [DEVELOPER_LOG.md](./DEVELOPER_LOG.md) for architecture details

---

**Built with ❤️ for SIUE Mass Communications**

*Last Updated: December 27, 2025*
////////////////////////////////////////////////////////////////////////////////////