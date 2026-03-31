# SafeGuard AI: Interview Preparation (20 Key Q&As)

This document provides a comprehensive list of technical and project-oriented questions to prepare for the **IITK Campus Drive** or any technical review of the **SafeGuard AI** platform.

---

### 🏗️ Architecture & Infrastructure

**1. Why did you choose a microservice (ML-Service) instead of including the AI logic in the main backend?**
> **Answer:** **Decoupling** the ML logic allows for **independent scaling**. If AI inference becomes a bottleneck, we can scale the `ml-service` horizontally across more nodes without affecting the core API or database performance.

**2. Explain the role of Redis and Celery in your moderation pipeline.**
> **Answer:** **Redis** acts as a high-speed **message broker**. When a user posts, we immediately return a success response to the UI. **Celery** then pulls the task from Redis to perform the heavy AI analysis in the **background**. This ensures the user experience is never blocked by network latency from the LLM.

**3. Why use SQLite instead of a more robust database like PostgreSQL?**
> **Answer:** SQLite was a conscious trade-off for **portability and zero-config deployment**. For the purpose of a campus drive or a portable audit, it allows the judges to run the entire system instantly without setting up a complex RDS instance, while still maintaining strict **relational safety** via SQLModel.

**4. How would you scale this system if it had 1 million active users?**
> **Answer:** I would migrate from SQLite to **PostgreSQL**, use a distributed Redis cluster, and deploy our containers on **Kubernetes (K8s)**. K8s' Horizontal Pod Autoscaler (HPA) would allow us to spin up more Celery workers and ML-Service instances based on the real-time queue depth.

---

### 🤖 AI/ML & Moderation Strategy

**5. How does your system handle high-context sarcasm or subtle toxicity?**
> **Answer:** Simple keyword filters fail at sarcasm. SafeGuard AI uses **LLM-based context analysis** via Groq. The model doesn't just look for "bad words"; it evaluates the **intent** of the sentence. If the intent is to mock or bully, the toxicity score reflects that regardless of individual words used.

**6. Why choose Groq LPU over running a local Llama model on your machine?**
> **Answer:** **Speed and cost**. Groq's LPUs provide sub-200ms inference time, which is critical for real-time moderation. Running a local model would require significant GPU resources and would have much higher latency, degrading the user experience.

**7. How do you distinguish between 'Safe Art' and 'NSFW Nudity'?**
> **Answer:** We use a **Hybrid Waterfall Logic**. If the NSFW score is at a boundary (e.g., 0.70 - 0.85), the content is moved to a `FLAGGED` state for **manual moderator review**. This prevents artistic or medical context from being incorrectly censored.

**8. What is the logic behind your Toxicity Scores (0.0 - 1.0)?**
> **Answer:** It is a **confidence interval**. A 0.95 score means the model is nearly certain of toxicity, trigger-blurring the post. A 0.50 score triggers a "High-Risk" tag, prompting a human moderator to make the final determination.

---

### 🔒 Security & Safety

**9. How do you secure user data and prevent unauthorized moderation overrides?**
> **Answer:** We use **JWT (JSON Web Tokens)** for stateless authentication. Every sensitive endpoint (like `/posts/{id}/moderate`) is protected by **Role-Based Access Control (RBAC)**, ensuring only users with the `moderator` role can access moderation functions.

**10. How do you handle passwords?**
> **Answer:** We never store plain-text passwords. We use the **Bcrypt** hashing algorithm with a salted hash, ensuring that even if the database were compromised, user credentials remain unreadable.

**11. How does the system handle "Misinformation" specifically?**
> **Answer:** We have a dedicated **Misinformation Scorer** that flags factual claims. If a post contains a health or safety claim that is likely false, it is tagged as `MISINFORMATION` and relegated to the bottom of the feed to prevent viral spread.

---

### 📊 Evaluation & Metrics

**12. Explain the difference between Precision and Recall in the context of moderation.**
> **Answer:** **Precision** measures our **reliability**—if we flag something as toxic, how often are we right? **Recall** measures our **safety**—how much of the total toxic content did we actually catch? We prioritize Recall to ensure a safer community.

**13. How do you evaluate the model since you aren't using an automated test suite?**
> **Answer:** We use **Human-in-the-Loop (HITL)** evaluation. Every manual override by a moderator serves as a **"Ground Truth"** label. We then calculate Accuracy, Precision, and Recall by comparing these manual labels to the initial AI verdict.

**14. What data did you use to verify your image moderation?**
> **Answer:** I utilized 50+ samples from the **Kaggle NSFW Detection Dataset**. This allowed me to ground my evaluation in a community-verified dataset rather than relying on subjective personal samples.

---

### 🛠️ Engineering Fundamentals

**15. What was the most difficult technical trade-off you made?**
> **Answer:** Choosing **SQLite over PostgreSQL**. While Postgres is more powerful, SQLite ensured zero-friction portability for the audit. I mitigated the risks by using **SQLModel**, which makes transitioning to Postgres a simple change to the connection string if needed later.

**16. Explain your CI/CD pipeline.**
> **Answer:** We use **GitHub Actions**. Every push triggers a linting check and a build test on our Docker containers. This ensures that a single developer can confidently maintain code quality and deployment readiness.

**17. Why use a Bento-Grid design for the moderator dashboard?**
> **Answer:** Bento grids are excellent for **data-dense environments**. A moderator needs to see multiple variables at once—the content, the AI reason, the risk scores, and the user metrics—without digging into nested menus.

**18. How do you handle "Adversarial Typos" (e.g., `H.4.T.E`)?**
> **Answer:** Traditional regex fails here. Because we use an **LLM-based approach**, the model "reads" the intent through the typos. The transformer-based architecture is robust enough to recognize misspelled or encoded words in context.

**19. What is your "Failure Mode" if the Groq API goes down?**
> **Answer:** The system is built with **Graceful Degradation**. If the ML service fails, the backend puts the post into a `PENDING` state and queues a retry task. The content remains hidden until the service recovers or a human manually reviews it.

**20. What is the next major feature you would add and why?**
> **Answer:** **Multi-Lingual Support**. Specifically for a campus like IITK, students might post in Hindi or Hinglish. Adding a translation layer or a multi-lingual LLM would be the final piece for full community inclusivity.
ull community inclusivity."