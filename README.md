# CodeNexus

CodeNexus is a coding practice and assessment platform built with a React/Vite frontend and a Spring Boot backend. It includes coding problems, submissions, learning quizzes, progress tracking, notifications, and administrative features.

## Technology stack

- Frontend: React, Vite, JavaScript
- Backend: Java 21, Spring Boot, Maven
- Database: MySQL
- Code execution: Docker (Docker Desktop for local development)

## Prerequisites

- Java 21
- Node.js and npm
- MySQL
- Docker Desktop (for the code execution feature)

## Local setup (Windows PowerShell)

### 1. Create the database

In MySQL, run:

```sql
CREATE DATABASE codenexus;
```

### 2. Configure backend environment variables

Open PowerShell in the project root and set the variables for the current terminal session. Replace the username and password with your own local MySQL credentials; do not commit them.

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/codenexus?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata"
$env:DB_USERNAME = Read-Host "MySQL username"
$securePassword = Read-Host "MySQL password" -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
Remove-Variable securePassword
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Keep this PowerShell session open while running the backend. The generated JWT secret is temporary for this session; existing tokens will no longer validate if the secret changes. For a persistent local setup, securely configure the environment variables in your own environment. Never commit real secrets.

### 3. Start the backend

In the same PowerShell session:

```powershell
Set-Location .ackend
.\mvnw.cmd spring-boot:run
```

The backend uses port `8080` by default.

### 4. Start the frontend

Open a second PowerShell terminal:

```powershell
Set-Location .rontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). The frontend defaults to the API at `http://localhost:8080/api`. If needed, set the API URL before starting Vite:

```powershell
$env:VITE_API_BASE_URL = "http://localhost:8080/api"
npm run dev
```

### 5. Code execution

Start Docker Desktop before using the code execution feature. The first execution may download the `eclipse-temurin:21` image.

## Verify builds

Backend tests:

```powershell
Set-Location .ackend
.\mvnw.cmd test
```

Frontend lint and build (from the project root, in a separate terminal or after the backend command finishes):

```powershell
Set-Location .rontend
npm install
npm run lint
npm run build
```

## Security notes

- Database credentials and the JWT signing secret must be supplied through environment variables.
- Do not commit `.env` files, passwords, tokens, private keys, or production database dumps.
- The application does not provide a universal admin password in this repository. Configure admin access through the application's intended account/role management flow.

## Repository structure

```text
CodeNexus/
├── backend/    # Spring Boot application
├── frontend/   # React/Vite application
├── .gitignore
└── README.md
```
