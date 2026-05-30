# Task_Time_Tracking_API

A productivity-focused task management backend built with TypeScript, Express, PostgreSQL, and Prisma.

The platform allows users to securely manage tasks, track time spent on individual activities through session-based timers, and generate daily productivity summaries. Authentication is handled through JWT-based access and refresh tokens with support for GitHub OAuth.

The project was designed with scalability, maintainability, and secure user data isolation in mind.


---


## 🚀 Features

- **User Authentication:** Secure local authentication using JWT (Access + Refresh Tokens).
- **GitHub OAuth Integration:** Login and register using GitHub.
- **Cookie-Based Security:** httpOnly cookies for secure token storage.
- **Token Refresh Flow:** Access token renewal using refresh token rotation.
- **Profile Management:** Update profile, change password, and delete account.
- **Task Management:** Create, update, delete, and retrieve tasks with status tracking.
- **Time Logging:** Start and stop timers per task with automatic duration calculation.
- **Daily Summary:** Aggregated view of today's time logged, task statuses, and session counts.
- **Zod Validation:** Strict request validation on all input schemas.
- **Optimized Database Queries:** Indexed Prisma schema for faster user and status-based queries.

---

## 🛠️ Tech Stack

### Backend:
- Node.js + Express.js (v5)
- Typescript

### Database:
- postgreSQL (Supabase)
- prisma

### Authentication:
- JWT (jsonwebtoken)
- passport.js (Github OAuth)

### Validation & Security:
- Zod
- bcryptjs
- cookie-parser
- cors

### Development Tools:
- Zed 
- Postman
- Git
- Github

---

## 📂 Project Structure

```
server/
├── config/
│   ├── connection.ts
│   └── passport.ts
├── controllers/
│   ├── authController.ts
│   ├── refreshController.ts
│   ├── summaryController.ts
│   ├── taskController.ts
│   ├── timeLogsController.ts
│   ├── tokenController.ts
│   └── userController.ts
├── middlewares/
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── logger.ts
│   ├── notFound.ts
│   └── validate.ts
├── prisma/
│   ├── migrations/
│   ├── prisma.config.ts
│   └── schema.prisma
├── routes/
│   ├── authRoute.ts
│   ├── summaryRoutes.ts
│   ├── taskRoutes.ts
│   ├── timeLogsRoute.ts
│   └── userRoutes.ts
├── types/
│   └── express.d.ts
├── utils/
│   └── jwtGeneration.ts
├── validation/
│   ├── authSchema.ts
│   ├── taskSchema.ts
│   └── userSchema.ts
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.ts
└── tsconfig.json
```

> **Note:** `generated/prisma/` and `node_modules/` are excluded for brevity.

---

## 🔐 Authentication & Security
- Passwords hashed using Bcryptjs.
- JWT-based authentication with Access (30m) + Refresh (7d) token pattern.
- Secure httpOnly cookies for token transport.
- Refresh token stored in DB and rotated on every refresh.
- GitHub OAuth using Passport strategy — links accounts by email if already exists.
- Strict schema validation using Zod on all routes.
- Protected routes using authentication middleware.

---

## 📝 Task & Time Tracking Session
### Tasks Section:
- Title & optional Description
- Status: PENDING | IN_PROGRESS | COMPLETED
- User-scoped — all queries filtered by authenticated user
- Includes aggregated timeLogs on list fetch

### Time-Logs Section:
- Start and stop timers per task
- Duration automatically calculated in seconds on stop
- Active timer guard — cannot start a second timer if one is already running
- Logs ordered by startTime descending

### Daily Summary Section:
- Scoped to today's date range (midnight to midnight)
- Aggregates: total time logged (seconds + formatted), completed/pending/in-progress counts
- Per-task breakdown: time logged today, session count
- Filters out tasks with no activity today that are still PENDING

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL or a Supabase account
- GitHub OAuth App (for OAuth login)

### 1️⃣ Clone the Repository

#### HTTPS
```bash
git clone https://github.com/RaghavM117/Task_Time_Tracking_App.git
cd TaskTracker
```

#### SSH
```bash
git clone git@github.com:RaghavM117/Task_Time_Tracking_App.git
cd TaskTracker
```

### 2️⃣ Install Dependencies
```bash
cd server
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the `server` folder and add:
```
PORT=5000
DATABASE_URL=your_supabase_pooled_connection_string
DIRECT_URL=your_supabase_direct_connection_string

JWT_SECRET=your_access_token_secret
REFRESH_JWT_SECRET=your_refresh_token_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

FRONTEND_URL=http://localhost:5173 
```
### 4️⃣ Setup Prisma
```bash
npx prisma migrate dev
npx prisma generate
```

### 5️⃣ Run the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

---

## 📡 Route Tables: 

### 🔒 Auth:
| Method | Endpoint | Description |
|:---|:---|:---|
| POST | `/api/auth/register` | Register with username, email, password |
| POST | `/api/auth/login` | Login with username or email + password |
| POST | `/api/auth/logout` | Invalidate session and clear cookies |
| GET | `/api/auth/github` | Initiate GitHub OAuth flow |
| GET | `/api/auth/github/callback` | GitHub OAuth callback |
| POST | `/api/auth/refresh` | Get new access token using refresh token |

### 👤 User:
| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---:|
| GET | `/api/user/profile` | Get current user's profile | ✅ |
| PATCH | `/api/user/profile` | Update name or email | ✅ |
| DELETE | `/api/user/profile` | Permanently delete account | ✅ |
| PATCH | `/api/user/changePassword` | Change password (local accounts only) | ✅ |

### 📝 Tasks:
| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---:|
| GET | `/api/task` | Get all tasks for current user | ✅ |
| POST | `/api/task` | Create a new task | ✅ |
| GET | `/api/task/:id` | Get task by ID with full time logs | ✅ |
| PUT | `/api/task/:id` | Update task title or description | ✅ |
| DELETE | `/api/task/:id` | Delete a task | ✅ |
| PATCH | `/api/task/:id/status` | Update task status | ✅ |

### 🕛 Time-Logs: 
| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---:|
| POST | `/api/time-log/tasks/:id/start` | Start timer for a task | ✅ |
| POST | `/api/time-log/tasks/:id/end` | Stop timer and save duration | ✅ |
| GET | `/api/time-log/tasks/:id/logs` | Get all time logs for a task | ✅ |

### 📖 Summary:
| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---:|
| GET | `/api/summary` | Get today's task and time summary | ✅ |

### 🎥 Monitoring Routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |
| GET | `/api/ready` | Database readiness check |

---

## Data Models:

### User:
| Field | Type | Notes |
|:---|:---|:---|
| id | String (UUID) | Primary key |
| email | String | Unique |
| name | String | |
| password | String? | Null for OAuth users |
| provider | String | `local` or `github` |
| providerId | String? | GitHub profile ID |
| refreshToken | String? | Rotated on each refresh |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Task:
| Field | Type | Notes |
|:---|:---|:---|
| id | String (UUID) | Primary key |
| title | String | Max 100 chars |
| description | String? | Max 500 chars |
| status | TaskStatus | PENDING / IN_PROGRESS / COMPLETED |
| userId | String | Foreign key → User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### TimeLog:
| Field | Type | Notes |
|:---|:---|:---|
| id | String (UUID) | Primary key |
| taskId | String | Foreign key → Task |
| userId | String | Foreign key → User |
| startTime | DateTime | |
| endTime | DateTime? | Null if timer still running |
| duration | Int? | Seconds, calculated on stop |
| createdAt | DateTime | |

---

## 🧪 Testing

The backend was manually tested using Postman.

Verified Functionality:
- User Registration
- User Login
- Refresh Token Flow
- Logout Flow
- GitHub OAuth Integration
- Profile Retrieval
- Profile Updates
- Password Updates
- Task CRUD Operations
- Task Status Management
- Timer Start / Stop Flow
- Time Log Retrieval
- Daily Productivity Summary Generation

---

## 🗺 Roadmap

Planned Improvements:
- React Frontend Application
- Real-Time Timer UI
- Dashboard Analytics
- Weekly Productivity Reports
- AI-Assisted Task Suggestions
- Automated Testing
- Full Cloud Deployment

---

## 📄 License

This project is licensed under the MIT License.
  
See the [LICENSE](./LICENSE) file for details.




