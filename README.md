# ⚡ LeetCoach AI (v2.0)

An interactive, full-stack AI-powered code review platform designed for software engineers practicing technical algorithms. Users can input any live LeetCode problem URL to dynamically provision a dedicated coding environment, receive comprehensive structural critique, and utilize optimized caching performance layers.

---

## 🚀 Core Features

* **Dynamic Problem Importer:** Seamlessly parses live LeetCode problem URLs to generate runtime database records and code configurations on the fly, eliminating rigid static data requirements.
* **Integrated In-Browser IDE:** Powered by the **Monaco Editor API** providing native syntax highlighting, automatic formatting, and real-time JavaScript workspace layout rendering.
* **Stateful User Lifecycle:** Implements secure **JWT authentication** coupled with sticky user state persistence across sessions using browser `localStorage`.
* **Intelligent Feedback Pipeline:** Couples raw user source snapshots with targeted context prompts to request deep time/space complexity analyses from advanced generative LLMs.
* **Dual-Layer Robustness:** Built-in AI resilience leveraging primary API models with an automated, seamless failover mechanism to backup LLM structures if rate limits are breached.
* **Optimized Local Caching:** Intercepts outgoing review pipelines to identify duplicate problem snapshot code submissions, instantly serving cached evaluations to reduce compute latency and token consumption metrics.

---

## 🛠️ System Architecture & Tech Stack

* **Frontend:** React, TypeScript, Monaco Editor, Vite
* **Backend:** Node.js, Express, TypeScript
* **Database & ORM:** Prisma ORM, PostgreSQL (via Neon Cloud)
* **Caching Layer:** Database/Local Caching Strategy

---

## 🛠️ Local Installation & Setup

### Prerequisites
Ensure you have **Node.js (v18+)** installed on your machine and a running PostgreSQL instance (or cloud provider account like Neon).

### 1. Repository Installation
```bash
git clone [https://github.com/MythriBodagala/LeetCoach-AI.git](https://github.com/MythriBodagala/LeetCoach-AI.git)
cd LeetCoach-AI