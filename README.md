#  Chat Backend API & Real-Time Engine

A robust, multi-tenant real-time messaging backend built with **Node.js**, **Express**, **TypeScript**, **Socket.IO**, and **Prisma ORM** backed by **PostgreSQL**.

---


##  Prerequisites

Before running the backend, ensure you have:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** database instance (either running locally or a hosted cloud database such as Neon, Supabase, Render, or Railway).

---

##  Environment Configuration

1. In the `chat-backend/` directory, create a `.env` file (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables:
   ```env
   # Application Server
   NODE_ENV=development
   PORT=3000

   # PostgreSQL Database Connection String
   # Format: postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?sslmode=require
   DATABASE_URL="postgresql://postgres:password@localhost:5432/chat-backend"

   # Allowed CORS Origins (e.g., your Next.js frontend port)
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001

   # JWT Configuration
   JWT_SECRET=super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=15m
   ```


---

##  Database Setup & Migrations

Once your PostgreSQL database is running and `DATABASE_URL` is set in `.env`:

### 1. Generate Prisma Client
Generates TypeScript types and the Prisma client code:
```bash
npx prisma generate
```

### 2. Sync Schema with Database
Pushes the schema definitions from `prisma/schema.prisma` directly to your PostgreSQL database:
```bash
npx prisma db push
```
---

##  How to View and Explore the Database

You can view, search, and manage all records in your database through multiple ways:

### Method 1: Prisma Studio (Recommended — Built-in Visual GUI)
Prisma provides a built-in visual browser interface to inspect and manage your data with zero extra software:

1. In the `chat-backend/` directory, run:
   ```bash
   npx prisma studio
   ```
2. Your default web browser will automatically open:
   👉 **`http://localhost:5555`**
3. **What you can do in Prisma Studio:**
   - **Browse Tables**: View all records in `Application`, `User`, `Conversation`, `Message`, etc.
   - **Inspect Relations**: Click on a user to view their conversations or sent messages directly.
   - **Filter & Sort**: Filter messages by conversation ID, search users by email, or sort by creation timestamp.
   - **Create / Edit Records**: Add a new Application, update user status, or delete test messages with one click.
   - **Save Changes**: Edits are committed live to your PostgreSQL database.

---

### Method 2: Third-Party Database GUI Clients
If you prefer a standalone database desktop application, connect using your `DATABASE_URL`:
- **pgAdmin**: Standard tool for PostgreSQL.
- **TablePlus** / **DBeaver** / **Beekeeper Studio**: Lightweight, modern database clients.
  - Choose **PostgreSQL** connection.
  - Paste your host, port, user, password, and database name from `DATABASE_URL` (or paste the connection URI directly).

---

### Method 3: Command Line (psql)
```bash
psql "your_postgresql_connection_string_here"
```
To list all tables:
```sql
\dt
```
To view all registered users:
```sql
SELECT id, name, email, "applicationId", "createdAt" FROM "User";
```

---
##  How to Start the Project

### Running in Development Mode
Starts the server with hot-reloading (auto-restarts on code changes using `tsx`):
```bash
npm run dev
```
The server will start on:
👉 `http://localhost:3000` (or the port specified in your `.env`)

### Running in Production Mode
Builds the TypeScript code and starts the compiled production server:
```bash
npm run build
npm start
```

---

##  Interactive API Documentation (Swagger)

The backend comes with an interactive OpenAPI / Swagger UI documentation interface:

1. Start the server (`npm run dev`).
2. Open your browser and navigate to:
   👉 **`http://localhost:3000/docs`** (or `http://localhost:3000/api/v1/docs`)
3. You can test all REST endpoints directly from the browser (Applications, Auth, Conversations, Messages, Health Check).

---

##  Creating an Application ID for the Frontend

The chat backend uses a **multi-tenant architecture**. Every user and conversation belongs to an **Application**.

When setting up your frontend (`chatapp-frontend`), you need an `applicationId` (UUID). Here is how to create one:

### Option A: Via Prisma Studio (Easiest)
1. Run `npx prisma studio`.
2. Click on the **`Application`** model.
3. Click **Add record**.
4. Set:
   - `name`: `My Web Chat`
   - `apiKeyHash`: `temp_dev_key_123` (any unique string)
   - `status`: `ACTIVE`
5. Click **Save 1 change**.
6. Copy the generated `id`.
7. Paste this into your frontend `.env.local`:
   ```env
   NEXT_PUBLIC_APPLICATION_ID="your-copied-uuid-here"
   ```

### Option B: Via API Request
Send a `POST` request to `/api/v1/applications`:
```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{"name": "My Web Chat"}'
```
Response:
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "3513ff04-7c76-47bf-9e2d-aa0a3afb8a27",
      "name": "My Web Chat"
    },
    "apiKey": "app_live_..."
  }
}
```

---

##  Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts development server with live reload (`tsx watch src/server.ts`) |
| `npx prisma studio` | Opens the web GUI database inspector on `http://localhost:5555` |
| `npx prisma db push` | Synchronizes the Prisma schema with your PostgreSQL database |
| `npx prisma generate` | Re-generates the Prisma client library and TypeScript types |
| `npm run build` | Generates Prisma client and compiles TypeScript to `dist/` |
| `npm start` | Pushes schema to DB and runs the compiled `dist/server.js` |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run format` | Auto-formats code with Prettier |
