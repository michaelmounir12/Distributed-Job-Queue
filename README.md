# 🚀 Distributed Job Queue System

A highly scalable, production-ready distributed job queue backend built with NestJS, BullMQ, Redis, and Docker. 

This system acts as a reliable asynchronous orchestrator designed to decouple long-running operations (such as Email delivery, Video transcoding, and AI NLP inference) from your main API. By offloading heavy tasks to a background worker fleet, the primary API maintains sub-millisecond response times under high-concurrency loads.

---

## 🏗️ Architecture Overview

The system is split into three primary decoupled components:
- **API Service (Producer):** A lightweight NestJS gateway that strictly validates incoming HTTP requests, constructs structured job payloads, and injects them onto the Redis queue.
- **Worker Service (Consumer):** A fleet of independent, headless Node.js microservices executing the background tasks. They listen to the queue, execute heavy I/O or CPU tasks, and stream progress events back sequentially. 
- **Redis (Broker):** The central immutable datastore holding all queue arrays, delayed schedules, failure states (Dead-Letter), and runtime states.

---

## ✨ Features

- **Robust Task Submission API**: Strictly validated REST endpoints enforcing DTO verification via `class-validator`.
- **Standalone Background Workers**: Containerized workers completely disconnected from the API runtime, simulating real-world workloads perfectly.
- **Production-Grade Retry Logic**: Deterministic error handling applying automatic exponential backoffs and up to 5 attempts per failed job.
- **Delayed Jobs**: Granular native support to schedule jobs dynamically into the future.
- **Deep Job Monitoring**: Polling endpoints exposing paginated states, numeric progress logs, attempts, and underlying lifecycle metrics.
- **High-Availability Configured**: Integrated global rate limiting, Pino structured logging, Prometheus telemetry, and robust Health markers.

---

## 🛠️ Tech Stack

- **NestJS**: Provides the rigid modular architecture, dependency injection, and enterprise TypeScript scaffolding. 
- **BullMQ**: The industry standard for Node.js message queues. Backed by Redis, offering atomic locks, delayed jobs, retries, and rate-bouncing natively.
- **Redis**: Functions natively as our hyper-fast, in-memory central broker connecting the APIs with the worker nodes.
- **Docker & Docker Compose**: Orchestrates multi-stage deterministic container deployments simplifying horizontal scaling.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (v9+)
- Docker & Docker Compose

### Running Locally (Docker Recommended)
Using the standardized Docker configuration ensures Redis and the standalone workers boot in parallel perfectly.

```bash
# 1. Clone the repository
git clone https://github.com/michaelmounir12/Distributed-Job-Queue.git
cd "job queue"

# 2. Spin up the cluster using docker-compose
docker-compose up --build -d
```

The services will expose:
- **API**: `http://localhost:3000`
- **Redis**: `localhost:6379`

### Local Development (Without Docker)
```bash
# Install dependencies
pnpm install

# Start local Redis (Required)
docker run -d -p 6379:6379 redis:7-alpine

# Start the API
pnpm run start:dev

# In a new terminal, start the standalone Worker Service
npx ts-node src/main-worker.ts
```

---

## 📡 API Endpoints

> **Note:** Endpoints require HTTP Bearer authentication if JWT config is enforced in standard environments.

### `POST /jobs/email`
Submits an email payload to the background workers.

**Body:**
```json
{
  "to": "user@email.com",
  "subject": "Reminder",
  "body": "Your appointment is tomorrow",
  "delay": 60000 
}
```
**Response:** `202 Accepted`
```json
{
  "jobId": "1",
  "name": "email",
  "status": "pending",
  "scheduledExecutionTime": "2026-03-18T16:51:32.000Z"
}
```

### `POST /jobs/video`
Submits a heavy video transcoding job.

**Body:**
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "format": "720p",
  "attempts": 3
}
```

### `POST /jobs/ai`
Submits an NLP analysis payload for sentiment deduction.

**Body:**
```json
{
  "text": "Analyze this document completely."
}
```

### `GET /monitoring/jobs/:id`
Retrieves granular lifecycle execution traces from the queue.

**Response:** `200 OK`
```json
{
  "id": "1",
  "status": "completed",
  "progress": 100,
  "attempts": 1,
  "logs": [],
  "timestamps": {
    "created": 1713459800000,
    "processed": 1713459801000,
    "finished": 1713459802000
  },
  "result": {
    "delivered": true,
    "timestamp": "2026-03-18T16:52:00.000Z"
  }
}
```

---

## 🔌 Queue System Design

At its core, the system orchestrates payloads securely via **BullMQ**:
- **Atomic Operations**: Prevents duplicate processing by utilizing Redis' locking mechanisms via atomic Lua scripts.
- **Failures & Delays**: Any `Error` thrown by a worker automatically triggers a reschedule. Jobs inherit an exponential backoff (`delay: 2000ms`), retrying up to `5` times. Exhausted jobs are persisted in a `"failed"` dead-letter state rather than being removed, ensuring no data loss. 

---

## 👷 Workers

The cluster supports autonomous classes processing payloads concurrently:
1. **Email Worker**: Simulates SMTP network latency and purposefully tests transient disconnect errors.
2. **Video Worker**: Simulates chunked multi-step work, pushing sequential `progress` updates (0-100%) back to Redis safely during transcoding simulations.
3. **AI Worker**: Fakes NLP sentiment inferences by generating outputs after simulating model loading delays.

These workers live entirely outside the HTTP loop inside `src/main-worker.ts`.

---

## 📈 Scaling the System

- **Horizontal Scaling**: Because the workers act as parallel consumers, you can horizontally scale processing power limitlessly. Adjust the `docker-compose.yml` replication count:
  ```bash
  docker-compose up --scale workers=5 -d
  ```
- **Redis as a Broker**: Redis operates entirely in-memory allowing tens of thousands of queued messages to route across connected consumers with zero latency overlap.

---

## 🔮 Future Improvements

- **Kafka / RabbitMQ Integration**: Swap Redis for an event-bus pipeline for complex Pub/Sub orchestration outside simple queue boundaries.
- **Monitoring UI Integration**: Host `bull-board` for visual, UI-driven queue and dead-letter queue management.
- **Kubernetes (K8s) Deployment**: Migrate Docker Compose scripts into Helm charts for robust pod auto-scaling using KEDA (Kubernetes Event-driven Autoscaling) measuring queue lengths.

---

## 📂 Folder Structure

```text
├── src/
│   ├── app.module.ts            # Main API configurations (Pino, Prometheus)
│   ├── main.ts                  # API Server entry point
│   ├── main-worker.ts           # Standalone Worker entry point
│   ├── worker-app.module.ts     # Headless Module Context
│   ├── config/                  # Envars & Redis definitions
│   └── modules/
│       ├── auth/                # JWT Access Controls
│       ├── health/              # Terminus Checks
│       ├── jobs/                # Submission API & DTOs
│       ├── monitoring/          # Queue observation API
│       └── workers/             # Dedicated Job Processors
├── Dockerfile                   # Multi-stage API image
├── Dockerfile.worker            # Multi-stage Worker image
└── docker-compose.yml           # Local Orchestration
```
