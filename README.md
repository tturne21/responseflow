# ResponseFlow API

A production-deployed REST API for managing customer service operations in real time — built as a solo project from scratch using Node.js, Express, PostgreSQL, and Prisma.

**Live API:** https://responseflow-api.onrender.com  
**API Documentation (Swagger UI):** https://responseflow-api.onrender.com/api-docs

---

## Overview

ResponseFlow is a backend system designed for hospitality and service businesses (hotels, restaurants, country clubs, retail). It tracks service requests from submission to completion, assigns them to staff, and gives managers visibility into response times and service quality.

The system handles the full lifecycle of a service request:

1. A customer submits a request
2. A manager assigns it to a staff member
3. Staff updates the status as they work
4. Completion is automatically timestamped
5. Managers can filter and monitor all activity in real time

---

## Features

- **JWT Authentication** — secure signup and login with bcrypt password hashing and 7-day token expiry
- **Role-Based Authorization** — three roles (staff, manager, admin) with enforced permission boundaries at every endpoint
- **Full CRUD** — complete Create, Read, Update, Delete for three main resources: Customers, ServiceRequests, and StaffAssignments
- **Business Logic Enforcement** — requests cannot be marked complete without an assignment; cancelled requests cannot be reassigned; staff can only modify their own assignments
- **Query Filtering** — filter service requests by status or priority; filter assignments by staff member
- **Swagger / OpenAPI 3.0** — fully documented, interactive API documentation with JWT authorization support
- **Database Seeding** — automated seed script with sample users, customers, requests, and assignments for immediate testing
- **Deployed to Render** — live production environment with PostgreSQL, environment variables, and auto-deploy on push

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| API Docs | Swagger UI / OpenAPI 3.0 |
| Deployment | Render |

---

## Project Structure

```
responseflow/
├── prisma/
│   ├── schema.prisma       # Database schema with enums and relations
│   └── seed.js             # Seed script for sample data
├── src/
│   ├── controllers/        # Request handling and business logic
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── serviceRequests.js
│   │   └── staffAssignments.js
│   ├── middleware/
│   │   └── auth.js         # JWT verification and role authorization
│   ├── repositories/
│   │   └── prismaClient.js # Prisma client singleton
│   ├── routes/             # Route definitions
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── serviceRequests.js
│   │   └── staffAssignments.js
│   └── server.js           # Express app entry point
├── swagger.yaml            # OpenAPI 3.0 specification
├── render.yaml             # Render deployment config
└── .env                    # Environment variables (not committed)
```

---

## Data Model

**Users** — authentication accounts with roles: `staff`, `manager`, `admin`  
**Customers** — the people submitting service requests  
**ServiceRequests** — the core workflow object (status: `open` → `assigned` → `in_progress` → `completed`)  
**StaffAssignments** — connects a request to the staff member handling it; auto-records `completedAt`

---

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| GET / POST | /api/customers | Manager, Admin |
| GET / PUT / DELETE | /api/customers/:id | Staff (GET only), Manager, Admin |
| GET / POST | /api/service-requests | Staff+ |
| GET / PUT / DELETE | /api/service-requests/:id | Staff (own), Manager, Admin |
| GET / POST | /api/staff-assignments | Manager, Admin |
| GET / PUT / DELETE | /api/staff-assignments/:id | Staff (own), Manager, Admin |

Full request/response documentation available at `/api-docs`.

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

```bash
git clone https://github.com/tturne21/responseflow.git
cd responseflow
npm install
```

Create a `.env` file:
```
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/responseflow"
JWT_SECRET="your-secret-key"
```

Run migrations and seed:
```bash
npx prisma generate
npx prisma migrate dev --name init
node --env-file=.env prisma/seed.js
```

Start the server:
```bash
npm run dev
```

Visit `http://localhost:3000/api-docs` for the interactive API documentation.

### Seed Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@responseflow.com | Admin1234! |
| Manager | manager@responseflow.com | Manager1234! |
| Staff | staff@responseflow.com | Staff1234! |
| Staff 2 | staff2@responseflow.com | Staff1234! |

---

## Deployment

This API is deployed on Render with a managed PostgreSQL database. The `render.yaml` config handles build, migration, seeding, and environment variable injection automatically on every push to `main`.

---

## Author

Built by Tiana Turner
