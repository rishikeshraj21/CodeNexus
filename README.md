# CodeNexus — Online Coding and Assessment Platform

CodeNexus is a full-stack coding and assessment platform designed to help developers practice programming problems, submit solutions, track their progress, and prepare for technical interviews.

The project combines a Spring Boot backend with a React frontend to provide coding practice, automated evaluation, quizzes, leaderboards, and interview preparation features.

> **Project type:** Full-Stack Web Application  
> **Status:** Under Development

## Features

### 👨‍💻 Coding Practice
- Browse programming problems.
- View problem details and test cases.
- Submit coding solutions.
- Track submissions and evaluation results.

### ⚙️ Code Execution and Evaluation
- Backend services for processing code submissions.
- Test-case-based solution evaluation.
- Docker-based code execution support.
- Submission result tracking.

**Note:** Supported programming languages and execution capabilities depend on the current implementation and configuration.

### 📊 Dashboard and Progress Tracking
- User dashboard.
- Submission history.
- Leaderboard.
- Problem bookmarks.
- Notifications.

### 🎯 Interview Preparation
- Interview preparation resources.
- AI interview feature.
- Quiz-based assessments.

### 🛡️ Administration
- Administrative dashboard.
- Submission management.
- User management.
- Learning-content management.

### 🔐 Authentication and Security
- User registration and login.
- JWT-based authentication components.
- Protected application routes.
- Environment-based configuration for sensitive settings.

## Technology Stack

| Component | Technologies |
|---|---|
| Backend | Java, Spring Boot |
| Frontend | React, JavaScript |
| Frontend tooling | Vite, npm |
| Database | MySQL |
| Authentication | JWT |
| Code execution | Docker-based execution support |
| Build tool | Maven |
| Development tools | VS Code, Git, GitHub |

## Project Architecture

```text
CodeNexus/
│
├── backend/
│   ├── src/main/java/com/codenexus/backend/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── executor/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   │
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Java Development Kit (JDK) 21
- Node.js and npm
- MySQL Server
- Git
- Docker Desktop, for the code-execution functionality

## Installation and Setup

### 1. Clone the repository

```powershell
git clone https://github.com/rishikeshraj21/CodeNexus.git
Set-Location CodeNexus
```

### 2. Create the MySQL database

Open your MySQL client and run:

```sql
CREATE DATABASE codenexus;
```

Ensure that your MySQL server is running.

### 3. Configure backend environment variables

Open a PowerShell terminal in the project root and configure the database connection and JWT secret.

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/codenexus?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata"

$env:DB_USERNAME = Read-Host "MySQL username"

$securePassword = Read-Host "MySQL password" -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
Remove-Variable securePassword

$env:JWT_SECRET = [Convert]::ToBase64String(
    [Security.Cryptography.RandomNumberGenerator]::GetBytes(48)
)
```

Keep this terminal open while running the backend. These environment variables apply to the current PowerShell session.

The generated JWT secret is temporary. Generating a different secret invalidates existing tokens signed with the previous secret.

For persistent local development, configure the environment variables securely. Never commit actual passwords, tokens, or signing secrets.

### 4. Start the backend

In the same PowerShell terminal:

```powershell
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

The backend uses port `8080` by default.

### 5. Start the frontend

Open a second PowerShell terminal:

```powershell
Set-Location "C:\GitHubUpload\CodeNexus\frontend"

npm install
npm run dev
```

Open the local URL printed by Vite. It is typically:

`http://localhost:5173`

The frontend is configured to use the backend API at:

`http://localhost:8080/api`

If necessary, configure the API URL before starting Vite:

```powershell
$env:VITE_API_BASE_URL = "http://localhost:8080/api"
npm run dev
```

### 6. Enable code execution

Start Docker Desktop before using the code-execution feature.

The first execution may download the `eclipse-temurin:21` Docker image. Ensure Docker is running and that the application's Docker execution configuration is correct.

## Verify the Build

### Backend tests

From the project root:

```powershell
Set-Location .\backend
.\mvnw.cmd test
```

### Frontend lint and production build

Open another terminal:

```powershell
Set-Location "C:\GitHubUpload\CodeNexus\frontend"

npm install
npm run lint
npm run build
```

Resolve any build or test failures before describing the project as fully tested.

## Security Considerations

- Supply database credentials and JWT secrets through environment variables.
- Never commit real passwords, API keys, private keys, or production database dumps.
- Do not publish real user data.
- Review the Docker execution configuration before exposing the application publicly.
- Configure administrative access through the application's intended account and role-management flow.

## Future Improvements

Potential enhancements include:

- Deployment with a production database.
- Improved automated testing and CI/CD.
- Additional coding languages and evaluation capabilities.
- More detailed user analytics.
- Application monitoring and logging.
- Improved documentation and interface screenshots.

These are potential improvements, not claims that they are already implemented.

## Author

**Rishikesh Raj**

B.Tech Computer Science and Engineering

GitHub: [rishikeshraj21](https://github.com/rishikeshraj21)

## Repository

[View CodeNexus on GitHub](https://github.com/rishikeshraj21/CodeNexus)