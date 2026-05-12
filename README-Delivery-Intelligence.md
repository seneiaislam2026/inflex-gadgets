# Customer Delivery Tracking and Analytics System

This is a production-ready, highly granular backend and admin panel feature designed to track customer orders across multiple logistics partners (Pathao, RedX, Sundarban) and analyze their trustworthiness through dynamic scoring logic.

## 🚀 Features
1. **Multi-Courier Tracking**: Tracks deliveries across external APIs, abstracted into different services.
2. **Background Sync Worker**: Runs a `node-cron` background job inside Express to automatically poll courier API statuses every 15 minutes.
3. **Analytics API**: Exposes a dynamic REST endpoint for fetching grouped courier insights and generating a Customer Trust Score securely over a rate-limited and JWT-protected pipeline.
4. **Intuitive Admin Panel UI**: Built in React with Tailwind CSS, visualizing total handled volume, trust classification, and historical timelines.

## 🛠 Tech Stack setup
- **Backend Framework**: Express / Node.js
- **Database**: MongoDB (via `mongoose`)
- **Queue/Jobs**: `node-cron`
- **Security**: JWT & `express-rate-limit`

## ⚙️ How to Setup

### 1. Configure MongoDB
Ensure you have your MongoDB URI set. If running locally, add it to your `.env` file:
```env
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/database"
JWT_SECRET="your_secure_secret"
```
In the AI Studio Preview environment, if this isn't configured, API routes will skip database seeding/running gracefully but returning no real values.

### 2. Configure Courier APIs
In `server/services/`, you'll find abstracted tracking services:
- `pathaoService.ts`
- `redxService.ts`
- `sundarbanService.ts`

Replace the mock functions with your actual registered API endpoints and credentials (like checking headers with internal API Keys).

### 3. Verify Background Tasks
The Courier Sync Job runs automatically on boot in `server.ts`:
```ts
import { startCourierSyncJob } from './server/jobs/courierSyncJob.ts';
startCourierSyncJob();
```

### 4. Running the application
```bash
npm install
npm run dev
```

### 5. Seeding Sample Data
If you need sample customer data to see the graphs and tracking logic locally, run:
```bash
npx -y tsx seed-analytics.ts
```
*(Make sure `.env` has your `MONGO_URI` registered).* 
Afterwards, search for `01711223344` in the Admin "Insights" panel. 
