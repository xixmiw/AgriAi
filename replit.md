# AgriAI - Agricultural Management System for Kazakhstan

## Overview
AgriAI is a full-stack agricultural management application built with React, Express, TypeScript, and PostgreSQL. The application helps farmers, agronomists, veterinarians, and managers in Kazakhstan to manage fields, livestock, weather data, and receive AI-powered recommendations via an intelligent chat assistant.

## Project Structure
- **client/**: React frontend with Vite build system
  - **src/components/**: UI components including field cards, livestock cards, weather widgets, AI chat
  - **src/pages/**: Dashboard, Fields, Livestock, Weather, Recommendations, Simulation, About, Auth, AIChat
  - **src/contexts/**: Language, Theme, and Auth contexts
  - **src/lib/**: Utility libraries including coordinate conversion (DMS format support)
- **server/**: Express backend API
  - **index.ts**: Main server entry point with session management
  - **routes.ts**: API route definitions including AI chat, weather, field analysis, livestock feeding plans
  - **auth.ts**: Passport.js authentication with bcrypt password hashing
  - **gemini.ts**: Google Gemini AI integration for concise agricultural consulting
  - **weather.ts**: OpenWeather API integration for real-time weather by coordinates
  - **ai-analysis.ts**: AI-powered field analysis, livestock feeding plans, and category recommendations
  - **storage.ts**: Chat history storage and retrieval
  - **db.ts**: Database connection using Drizzle ORM
  - **vite.ts**: Vite development server setup
- **shared/**: Shared TypeScript schemas and types
  - **schema.ts**: Drizzle ORM database schemas (users, fields, livestock, chat_messages)

## Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express, TypeScript, Passport.js
- **Database**: Neon PostgreSQL with Drizzle ORM
- **AI**: Google Gemini API for agricultural consulting
- **Authentication**: Passport Local Strategy with bcrypt
- **Session Management**: express-session with PostgreSQL store
- **State Management**: TanStack Query
- **UI Components**: Radix UI primitives with custom styling
- **Deployment**: Single server serving both API and frontend on port 5000

## Database Schema
- **users**: User authentication (id, username, password, fullName, role)
  - Roles: farmer, agronomist, veterinarian, manager
- **fields**: Agricultural fields (id, userId, name, latitude, longitude, area, cropType)
  - Supports Google Maps DMS coordinate format: e.g., 54°52'59.2"N 69°14'13.8"E
- **livestock**: Livestock management (id, userId, type, count)
- **chat_messages**: AI chat history (id, userId, role, content, timestamp)

## Key Features
1. **Role-Based Authentication**: Secure login/registration with different user roles
2. **AI Agricultural Assistant**: Concise, structured plans and recommendations (no long explanations)
3. **Automatic Field Analysis**: When creating a field, AI immediately provides:
   - Yield optimization strategies
   - Risk assessment
   - Seasonal timeline
   - Specific recommendations
4. **Field Management Menu**: Each field has detailed recommendations for:
   - Fertilizers (types, amounts, timing)
   - Soil management (testing, improvement)
   - Pesticides and crop protection
5. **Smart Livestock Management**: When adding livestock, AI generates:
   - Detailed feeding composition with percentages (wheat, barley, corn, etc.)
   - Daily feed amounts per animal
   - Feeding schedules (times and frequency)
   - Nutrition tips for optimal health
6. **Real-Time Weather**: Live weather data from OpenWeather for each field location:
   - Current temperature and conditions
   - Humidity, pressure, wind speed
   - Location-specific forecasts
7. **Simulation Tools**: Agricultural scenario modeling

## Coordinate Format
The application accepts coordinates in Google Maps DMS (Degrees, Minutes, Seconds) format:
- Example: 54°52'59.2"N 69°14'13.8"E
- Automatically converts to decimal format for database storage
- Supports both N/S and E/W hemisphere indicators

## Development
The application runs a single Express server that:
- Serves API routes at `/api/*`
- Handles authentication at `/api/auth/*`
- Provides AI chat at `/api/chat/*`
- Serves the React frontend via Vite in development mode
- Runs on port 5000 (0.0.0.0)
- Uses session-based authentication with secure cookies

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `GEMINI_API_KEY`: Google Gemini API key for AI chat (required)
- `OPENWEATHER_API_KEY`: OpenWeather API key for real-time weather data (required)
- `NODE_ENV`: Set to 'development' or 'production'
- `PORT`: Server port (defaults to 5000)
- `SESSION_SECRET`: Secret for session encryption (auto-generated in dev)

## Security Features
- Password hashing with bcrypt (10 rounds)
- Session-based authentication with Passport.js
- Secure session storage in PostgreSQL
- Role-based access control
- CORS configuration for secure API access

## Setup Instructions for Replit

### 1. Database Setup
Create a PostgreSQL database in Replit:
- Click the "Database" tab in the left sidebar
- Click "Create Database" to provision a Neon PostgreSQL database
- The `DATABASE_URL` environment variable will be automatically set

After creating the database, push the schema:
```bash
npm run db:push
```

### 2. API Keys Setup
The application requires two API keys as environment variables:

**GEMINI_API_KEY** (Required for AI features):
- Visit https://aistudio.google.com/apikey
- Create a new API key for Google Gemini
- Add it to your Replit Secrets

**OPENWEATHER_API_KEY** (Required for weather features):
- Visit https://openweathermap.org/api
- Sign up and get a free API key
- Add it to your Replit Secrets

### 3. Running the Application
The workflow is already configured to run `npm run dev` automatically.
- Frontend: Accessible via the Webview (port 5000)
- Backend API: http://localhost:5000/api

### 4. Deployment
The application is configured for autoscale deployment:
- Build command: `npm run build`
- Run command: `npm start`
- Both frontend and backend are served from port 5000

## Recent Changes
- **2025-11-09**: Configured for Replit environment with proper port binding (5000)
- **2025-11-09**: Set up deployment configuration for autoscale
- **2025-11-09**: Configured Vite to allow all hosts for Replit proxy compatibility
- **2025-11-09**: Added setup instructions for database and API keys
- **2025-11-08**: Initial project import to Replit environment
- **2025-11-08**: Implemented role-based authentication system (farmer, agronomist, veterinarian, manager)
- **2025-11-08**: Integrated Google Gemini AI for agricultural chat assistant with concise, structured responses
- **2025-11-08**: Added chat history storage in PostgreSQL
- **2025-11-08**: Implemented Google Maps DMS coordinate format support
- **2025-11-08**: Fixed authentication flow with proper redirect handling
- **2025-11-08**: Created full-featured AI chat page with message history
- **2025-11-08**: Added OpenWeather API integration for real-time weather data by field coordinates
- **2025-11-08**: Implemented automatic field analysis on creation with AI recommendations
- **2025-11-08**: Added livestock feeding plans with detailed ingredient percentages and schedules
- **2025-11-08**: Created field recommendation menu (fertilizer, soil, pesticides) with AI-generated advice
- **2025-11-08**: Updated all frontend components to display AI analysis results and feeding plans
