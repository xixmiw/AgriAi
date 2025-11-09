# AgriAI - Agricultural Management System for Kazakhstan

## Overview
AgriAI is a full-stack agricultural management application designed for farmers, agronomists, veterinarians, and managers in Kazakhstan. It facilitates the management of fields and livestock, provides real-time weather data, and offers AI-powered recommendations through an intelligent chat assistant. The project's vision is to enhance agricultural productivity and decision-making through technology, offering a comprehensive platform for modern farming needs.

## User Preferences
I want the AI to provide concise, structured plans and recommendations, avoiding long explanations. When generating recommendations, the AI should use JSON format for reliable, structured responses and calculate realistic quantities based on field area (hectares) and livestock count. I prefer that the AI provides analysis on the effectiveness, cost optimization, warnings, and suggestions for recommendations. I also prefer the application to be in Russian.

## System Architecture
AgriAI is built with a React frontend (Vite, TypeScript, Tailwind CSS, Radix UI) and an Express backend (TypeScript, Passport.js). It uses a Neon PostgreSQL database with Drizzle ORM. The application serves both the API and frontend from a single Express server on port 5000.

**UI/UX Decisions:**
The application features a non-minimalist design with modern gradients, animations, and hover effects. It utilizes Radix UI primitives for components, styled with Tailwind CSS. Data visualizations are implemented using the Recharts library, including comprehensive charts for field and livestock summaries.

**Technical Implementations & Feature Specifications:**
*   **Role-Based Authentication:** Secure login/registration with roles: farmer, agronomist, veterinarian, manager.
*   **AI Agricultural Assistant:** Integrates Google Gemini for structured agricultural advice, including yield optimization, risk assessment, seasonal timelines, and specific recommendations for fertilizers, soil management, and crop protection. It also generates detailed livestock feeding plans with proportional ingredient percentages, daily amounts, and schedules.
*   **Field Management:** Supports creation, editing, and detailed analysis of agricultural fields. Accepts Google Maps DMS coordinate format (e.g., 54°52'59.2"N 69°14'13.8"E) and converts to decimal.
*   **Livestock Management:** Features include tracking livestock count, health statistics (healthy, warning, critical, dead), and an IoT simulation for individual animal monitoring (temperature, heart rate, activity). It allows for adjusting livestock counts and disposing of dead animals.
*   **Real-Time Weather:** Integrates OpenWeather API to provide location-specific weather data for each field, including current conditions and forecasts.
*   **Profile System:** Users can customize their profiles with email, phone, location, company, and avatar.
*   **Voice Input:** Integrated voice input for the AI chat assistant, supporting Russian language.

**System Design Choices:**
*   **Session Management:** Uses `express-session` with a PostgreSQL store for secure user sessions.
*   **State Management:** TanStack Query is used for efficient data fetching and state management.
*   **Database Schema:** Includes tables for `users` (with roles and profile details), `fields` (with geographic data and crop types), `livestock` (with type and count), and `chat_messages` (for AI chat history).
*   **Security:** Implements password hashing (bcrypt), session-based authentication, role-based access control, and CORS configuration.

## External Dependencies
*   **Database:** Neon PostgreSQL
*   **AI:** Google Gemini API
*   **Weather:** OpenWeather API
*   **Authentication:** Passport.js (Local Strategy)
*   **ORM:** Drizzle ORM
*   **UI Components:** Radix UI
*   **Charting Library:** Recharts
*   **Speech Recognition:** `react-speech-recognition` library