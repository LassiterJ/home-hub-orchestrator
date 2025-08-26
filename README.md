# 🏠 HomeHub

**HomeHub** is a modular home network and automation management system. **This project is currently a proof of concept and in progress.**
It provides a single control layer for managing everything in your home that is network-accessible or directly connected to the hub computer — from IoT devices and smart appliances, to secured CCTV feeds.  

Computer vision is a **core feature module**, enabling live detection (e.g., person at door, vehicle in driveway) and event-driven automation. But HomeHub extends beyond CV: it is designed as a **general orchestrator for your digital home**, supporting triggers, workflows, notifications, and integration with external systems or agents.

This repository contains the **Orchestrator**, the TypeScript service that coordinates all modules: device ingestion, CV inference, trigger evaluation, storage, and automation workflows. It serves as the backbone of HomeHub.

| [Stack](#-stack) | [Highlights](#-highlights) | [Quick start](#-quick-start) | [Architecture](#-architecture) | [Scripts](#-scripts) | [Env](#-envs) | [Ports](#-ports) | [License](#-license) |

---

## 🔧 Stack

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![tRPC](https://img.shields.io/badge/tRPC-2596BE.svg?style=for-the-badge&logo=tRPC&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444.svg?style=for-the-badge&logo=Turborepo&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-%2314151B.svg?style=for-the-badge&logo=vitest&logoColor=white&color=green)

---

## 🌟 Highlights

- 🔌 **Device management**: unify IoT devices, smart appliances, and local network control  
- 🎥 **Closed-loop CCTV**: ingest secured video feeds and process them locally (no cloud dependency)  
- 👁️ **Computer vision module**: YOLOv8 today, extensible to pose/segmentation/classification  
- 🔑 **Triggers**: rule-based, composite, or LLM-defined, all sharing a common TypeScript interface  
- 📦 **Extensible modules**: self-contained ingestion, CV server, orchestrator, storage, automation, UI  
- 🔗 **Standard API contracts**: TypeScript ↔ Python boundary with clean request/response schemas  
- 🧪 **Testing & CI/CD**: Vitest + GitHub Actions pipeline  
- 📊 **Observability**: structured logging, metrics, trace IDs  

---

## 🚀 Quick start

1. **Install dependencies**
   ```sh
   pnpm install
   ```

2. **Start Python CV API (for vision features)**
   ```sh
   cd cv-api
   uvicorn main:app --reload
   ```

3. **Start Orchestrator**
   ```sh
   pnpm dev
   ```

Hit the Python API with `/detect` to see detections, then view logged events in the orchestrator.

---

## 🏗 Architecture

```
[ Home Devices / Cameras / Sensors ]
      ↓
[ Ingestion Modules ]
      ↓
[ Python CV API (YOLOv8, etc) ]  ← only for CV-enabled feeds
      ↓
[ TS Orchestrator: Triggers, Storage, Logic, Automation ]
      ↓
[ UI / API / Notifications / Integrations ]
```

- **Ingestion**: IoT device data, network APIs, camera streams, local sensors  
- **Processing**: CV detections or device state changes normalized as events  
- **Storage**: metadata in Postgres/SQLite; image snippets or logs in local/S3  
- **Automation**: triggers → actions (notify user, turn on light, log event, call API)  
- **Notification**: UI dashboard, API, webhooks, smart-home integrations  

---

## 🎯 POC Goals

The current proof-of-concept focuses on **computer vision** while establishing the extensible architecture:

- Ingest a live camera feed or video file  
- Run real-time person detection (YOLOv8)  
- Log detection events with timestamp, confidence, and snippet  
- Expose events via API/UI  
- Prove modularity: plug in new models or devices without refactor  

Future POCs will expand to general device management and automation workflows.

---

## ⌨ Scripts

| command              | description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`           | Launch orchestrator + watch mode                                            |
| `pnpm start`         | Run production build of the server                                          |
| `pnpm pm2:start`     | Run server build as background process (pm2)                                |
| `pnpm pm2:logs`      | Show pm2 logs                                                              |
| `pnpm lint` / `fix`  | Run eslint across workspaces                                                |
| `pnpm ts:check`      | TypeScript project references check                                         |
| `pnpm build`         | Build all apps/packages                                                     |
| `pnpm test:*`        | Run unit/integration/e2e tests (Vitest)                                     |
| `pnpm test:coverage` | Generate coverage reports                                                   |

---

## 🔒 Envs

All services load config from `.env` files.  
Example (`orchestrator/.env`):

```ini
DB_URL=postgres://...
CV_API_URL=http://cv-api:8000
LOG_LEVEL=debug
PORT=3000
```

---

## 🌐 Ports

- 🌐 :3000 – Orchestrator API / Web  
- 🖥️ :3001 – Python CV API  

---

## 📜 License

[MIT](./LICENSE)
