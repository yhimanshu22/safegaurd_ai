# Personal Contribution Summary: SafeGuard AI

**Name**: [Your Name]
**Role**: AI/ML Engineer & Frontend Lead

## 🚀 What I Built
- **End-to-End AI Integration**: Architected the connection between the FastAPI backend and the Groq-powered ML microservice, enabling sub-200ms text and image moderation.
- **Async Task Orchestration**: Implemented the Celery + Redis worker logic to ensure that complex AI analysis never blocks the user experience.
- **Role-Based Access Control (RBAC)**: Developed the secure signup/login flow and the conditional UI that distinguishes between standard Users and Platform Moderators.
- **Data Visualization**: Designed and built the "Bento Grid" metrics dashboard to provide moderators with real-time accuracy and recall stats.

## 🧠 Key Decisions Made
1. **Decision**: Using Groq's LPU via API instead of local hosting.
   - **Rationale**: Achieved enterprise-grade speed (Llama 3/4) without the heavy infrastructure overhead, allowing us to focus on the business logic and user safety.
2. **Decision**: Implementing a `FLAGGED` state for boundary cases.
   - **Rationale**: Acknowledged AI limitations (sarcasm/medical nudity) by moving uncertain content to a moderator review queue instead of flat-out rejection.

## 🛠️ Challenges Faced
- **Windows Worker Issues**: Encountered `PermissionError` [WinError 5] with Celery. **Solution**: Configured the worker with the `-P solo` execution pool to handle Python's process-spawning limitations on Windows.
- **State Synchronization**: Ensuring the Role-Based UI updated immediately upon login without a manual refresh. **Solution**: Focused on React `useEffect` hooks and `localStorage` persistence.

## 📈 Improvements I Would Make
1. **Model Fine-Tuning**: Move from 0-shot/few-shot prompting to a fine-tuned LoRA for even higher accuracy in specific niche toxicity.
2. **Real-time Notifications**: Integrate WebSockets to notify users the *instant* their post is approved/rejected by a human moderator.
3. **Advanced Rate Limiting**: Implement a Redis-based rate limiter per user to prevent API abuse.
