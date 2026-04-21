# WhatsApp Clone — Real-Time Chat App

This is a full-stack real-time chat application built with **Next.js**, **ASP.NET Core**, **SignalR**, and **PostgreSQL**.

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js (LTS)](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## 🛠️ Project Setup

### 1. Database
Ensure Docker Desktop is running and start the PostgreSQL container:
```bash
docker-compose up -d
```

### 2. Backend (ASP.NET Core)
Navigate to the backend folder and run the API:
```bash
cd backend
dotnet run
```
The API will be available at `https://localhost:7111` (or check the terminal output for the correct port).

### 3. Frontend (Next.js)
Navigate to the frontend folder and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The UI will be available at `http://localhost:3000`.

---

## 🏗️ Tech Stack
- **Frontend**: Next.js 14+, Tailwind CSS, TypeScript
- **Backend**: ASP.NET Core Web API, SignalR (Real-time)
- **Database**: PostgreSQL with EF Core
- **Infrastructure**: Docker & Docker Compose

---

## 📅 Roadmap
See [realtime-chat-phases.md](./realtime-chat-phases.md) for the full build phases.
