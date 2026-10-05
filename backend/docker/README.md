# CloudCalc Pro - Docker Setup

This folder contains Docker-related documentation for the CloudCalc Pro backend.

## Docker Architecture

CloudCalc Pro uses Docker to run the backend and MySQL database in separate containers.

```text
CloudCalc Pro
│
├── Backend Container
│   ├── Azure Functions
│   ├── Node.js
│   └── REST APIs
│
└── MySQL Container
    ├── CloudCalc Database
    ├── Users
    └── Calculation History
```

## Containers

### 1. Backend Container

Container name:

```text
cloudcalc-backend
```

The backend container runs the Azure Functions application.

### 2. MySQL Container

Container name:

```text
cloudcalc-mysql
```

The MySQL container stores CloudCalc Pro application data.

## Docker Files

The main Docker configuration files are located in the `backend` folder:

```text
backend/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── docker/
    └── README.md
```

## Database Initialization

Docker Compose automatically initializes the MySQL database using:

```text
database/schema.sql
database/seed.sql
```

The database name is:

```text
cloudcalc
```

## Ports

| Service | Local Port | Container Port |
| ------- | ---------: | -------------: |
| Backend |       7071 |             80 |
| MySQL   |       3307 |           3306 |

The backend can be accessed locally through:

```text
http://localhost:7071
```

MySQL is available on:

```text
localhost:3307
```

## Starting the Containers

Open Command Prompt or PowerShell in the backend folder:

```text
cd C:\Users\Sejal\CloudCalc-Pro\backend
```

Start the application:

```text
docker compose up --build
```

The `--build` option rebuilds the backend Docker image before starting the containers.

## Running in Background

To run the containers in the background:

```text
docker compose up -d --build
```

## Checking Containers

Run:

```text
docker compose ps
```

Both containers should be running:

```text
cloudcalc-backend
cloudcalc-mysql
```

## Stopping Containers

To stop the application:

```text
docker compose down
```

## Database Persistence

MySQL data is stored in a Docker volume:

```text
mysql_data
```

This allows the database data to remain available when the containers are restarted.

## Project Benefits

Docker provides:

* Consistent development environment
* Isolated backend and database services
* Easy project setup
* Portable deployment environment
* Simplified service management
* Better separation between application and database

## CloudCalc Pro Architecture

```text
Frontend
    │
    ▼
REST API
    │
    ▼
Azure Functions / Node.js
    │
    ▼
MySQL Database
    │
    ▼
Power BI Analytics
```

Docker provides the containerized environment for the backend and MySQL services during development and deployment.
