# AI Content Scanner (C2PA & SynthID Detection)

![AI Content Scanner Upload Interface](./upload_interface.png)

## Project Overview

The **AI Content Scanner** is a highly scalable, polyglot microservice application engineered to perform cryptographic provenance verification and deep statistical analysis on media assets. Designed to combat deepfakes and AI-generated media, this system leverages bleeding-edge detection paradigms, including C2PA (Coalition for Content Provenance and Authenticity) signatures and Google DeepMind's SynthID watermarks. The architecture is built for high availability and robust performance, separating heavy machine-learning workloads from the API gateway using containerized Python microservices.

## Key Features

### C2PA Cryptographic Verification
Extracts and validates embedded manifest signatures to verify the unadulterated provenance of physical captures.

![Cryptographic Image Scan Results](./scanned_image_original.png)

### SynthID Deepfake Detection
Utilizes deep statistical heuristics to detect imperceptible AI watermarks embedded within image pixel data and text generation layers.

![AI Text Detection Results](./scanned_text_AI.png)

### Persistent Scan History
User scans are securely indexed in MongoDB for chronological history, utilizing compound queries and caching.

![User Scan History Dashboard](./scan_history.png)

### Polyglot Microservice Architecture
An Express API gateway reliably queues and offloads heavy inference requests to decoupled Dockerized Python FastAPI nodes.

### Secure File Storage
Unverifiable raw image uploads are securely pushed directly to AWS S3 using short-lived signed URLs for async processing.

### Role-Based Authentication
Secure JWT-based session management coupled with bcrypt-hashed credentials stored in PostgreSQL via Prisma ORM.

### Responsive Mobile Dashboard
A dark-themed, glassmorphic UI engineered with React and Tailwind CSS, meticulously optimized for adaptive mobile overflow constraints.

## Tech Stack

### Frontend Architecture
- **Framework**: React (TypeScript) + Vite
- **Styling**: Tailwind CSS, Framer Motion, Lucide React
- **Routing & State**: React Router v6, Context API

### Backend Architecture
- **API Gateway**: Node.js, Express.js
- **ML Microservices**: Python, FastAPI, Docker
- **Primary Database**: PostgreSQL (Prisma ORM)
- **Document Store**: MongoDB (Mongoose ORM)
- **Storage Strategy**: AWS S3, Multer (Memory Buffers)

### Infrastructure & Deployment
- **Frontend Hosting**: AWS S3 + AWS CloudFront (Reverse Proxy & CDN)
- **Backend Hosting**: AWS EC2 (GPU-accelerated instances for Python workers)
- **Containerization**: Docker, Docker Compose

## Cloud Architecture Setup

This application is engineered for horizontal scalability on AWS infrastructure.

1. **Edge Routing (AWS CloudFront)**: Client requests are intercepted by CloudFront. Static assets are served from the S3 origin bucket with zero-latency caching, while `/api/*` routes are proxied via custom behaviors directly to the EC2 API Gateway.
2. **Static Hosting (AWS S3)**: The compiled Vite output is hosted in an S3 bucket configured for static web hosting. Strict bucket policies ensure read-only access exclusively from the CloudFront Distribution ID.
3. **API Gateway & Microservices (AWS EC2)**: The core logic layer resides on EC2 instances. PM2 maintains the Node.js Express service, while the Python FastAPI ML microservice runs inside an isolated Docker container configured for NVIDIA GPU passthrough.
4. **Data Persistence (AWS RDS & S3)**: Transactional user identity and session data map to a managed PostgreSQL RDS instance. NoSQL document storage (scan histories, raw metadata payloads) utilizes an external MongoDB cluster. Image buffer payloads are strictly pushed to an isolated private S3 bucket.

## Local Installation

Ensure your local development environment has Node.js (v18+), Python (v3.10+), and Docker installed.

### 1. Clone the Repository
```bash
git clone https://github.com/parimalingle1805/ai-content-detector.git
cd ai-content-detector
```

### 2. Configure the Backend (Node.js API)
```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

### 3. Configure the ML Microservice (Python FastAPI)
```bash
cd python-microservice
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*(Alternatively, deploy the microservice locally using Docker: `docker-compose up -d --build`)*

### 4. Configure the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

To run the application locally, initialize a `.env` file in the respective module directories.

**Backend (`/backend/.env`)**
```env
# Server
PORT=5000
NODE_ENV=development

# Databases
DATABASE_URL="postgresql://user:password@localhost:5432/ai_scanner?schema=public"
MONGODB_URI="mongodb://localhost:27017/ai_scanner_logs"

# Authentication
JWT_SECRET="your_cryptographic_jwt_secret"
JWT_EXPIRES_IN="7d"

# AWS Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET_NAME="your-s3-scan-bucket"

# Microservice Endpoints
PYTHON_ML_SERVICE_URL="http://localhost:8000/api/v1/detect"
```

**Frontend (`/frontend/.env`)**
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```
