# Technical Implementation Blueprint: PRD Architect Generator

## 1. Product Design Requirements (PDR)

**Vision & Concept**
PRD Architect Generator is a centralized AI-powered workspace designed to drastically reduce the time product teams spend documenting features, architecture, and database schemas. It transforms brief project descriptions into standardized, comprehensive Product Requirements Documents (PRDs).

**Target Personas**
*   **Product Managers (PMs):** Need fast, standardized templates for PRDs and business requirements.
*   **Business Analysts (BAs):** Focus on translating stakeholder needs into actionable user stories and acceptance criteria.
*   **Software Engineers / Architects:** Require automated scaffolding of ERDs, UMLs, and System Architecture diagrams.
*   **Project Managers:** Need oversight on project roadmaps and clear technical scopes.

**Primary User Stories**
*   *As a PM*, I want to follow a wizard to input my project details so that I can generate a tailored, comprehensive PRD in under 10 seconds.
*   *As a Software Engineer*, I want the system to generate Mermaid/PlantUML syntax for ERDs and architectures so that I can easily embed them in my technical documentation.
*   *As an Admin*, I want to manage user roles and organizational permissions to enforce security and access control.

**Success Metrics & Acceptance Criteria**
*   **Performance:** End-to-end generation of a PRD must complete in < 10 seconds (System target: < 3 seconds API response for partials).
*   **Adoption:** 70% Day-30 User Retention.
*   **Throughput:** Scalable to handle generating 10,000+ PRDs per month.

---

## 2. Tech Stack Analysis

**Frontend Layer**
*   **Core:** React 19 with TypeScript, utilizing Vite for high-performance builds and HMR.
*   **State Management:** Zustand for global state (e.g., active PRD workspace, user session) and TanStack Query for asynchronous data fetching and caching.
*   **UI/Styling:** TailwindCSS and Shadcn UI. Provides headless, accessible components with utility-first styling for a highly customizable yet standard design system.

**Backend & API Layer**
*   **Core:** Node.js with Express.js written in TypeScript. Chosen for its massive ecosystem and non-blocking I/O, perfect for proxying requests to LLMs (Gemini).
*   **API Specification:** RESTful API architecture documented automatically via Swagger (OpenAPI 3.0).

**Data & Persistence Layer**
*   **Primary Database:** PostgreSQL (Relational). chosen for robust ACID compliance, structured schemas (Users, Projects, Documents), and complex relational queries.
*   **Caching:** Redis. Used to cache frequently accessed PRD templates and manage rate-limiting for the AI generation endpoints.
*   **Storage:** Firebase Storage for storing exported assets (PDFs, images of UMLs).

**Authentication & Security**
*   **Provider:** Firebase Authentication (coupled with custom JWTs for backend API authorization) and OAuth 2.0.
*   **RBAC:** Custom Role-Based Access Control implemented in the PostgreSQL database mapped to JWT claims.

**AI Integration**
*   **Model:** Google Gemini Pro natively integrated via `@google/genai`. Provides large context windows necessary for exhaustive technical documentation generation.

---

## 3. App Flowchart Design

**High-Level System Flow**
1.  **Authentication Flow:** User logs in via Firebase Auth / OAuth -> Retrieves JWT -> Backend validates and issues session.
2.  **Dashboard Navigation:** User accesses standard modules (Library, Templates, Generator).
3.  **PRD Generation Wizard:**
    *   *Step 1 (Project Info):* User inputs Project Name, Type, Description.
    *   *Step 2 (Tech Stack):* Selects frameworks, databases, and deployment targets.
    *   *Step 3 (Problem Stmt):* Defines pain points and expected outcomes.
    *   *Step 4 (Processing):* React client sends structured payload to Express Backend.
    *   *Step 5 (AI Orchestration):* Backend constructs Gemini prompt -> Receives Markdown/Mermaid output -> Stores structured response in PostgreSQL.
4.  **Diagram Rendering:** Client parses Mermaid payload and renders dynamic SVG diagrams in the UI.
5.  **Export Flow:** User requests PDF/DOCX -> Backend fetches document -> Triggers headless browser/converter -> Uploads to Firebase Storage -> Returns signed download URL.

---

## 4. Project Rules and Standards

**Code Versioning & CI/CD**
*   **Branching Strategy:** GitFlow (main, develop, feature/*, hotfix/*).
*   **Commit Convention:** Conventional commits (e.g., `feat: add wizard step 1`, `fix: render mermaid syntax`).
*   **CI/CD Pipeline:** GitHub Actions automatically running ESLint, TypeScript compilation, and Jest tests on PRs to `develop`. Automated deployments to Vercel (Frontend) and Render/Railway (Backend) on merge to `main`.

**Code Quality**
*   **Formatting:** Prettier (Format on Save enforced via VS Code workspace settings).
*   **Linting:** ESLint with strict TypeScript rules.
*   **Code Review:** Require at least 1 approval. No pushing directly to `main` or `develop`.

---

## 5. Implementation Plan

*Agile Scrum Framework (2-Week Sprints)*

*   **Sprint 1: Foundation & Auth**
    Initial project setup (Vite, Express, PostgreSQL). Implement Firebase Authentication, RBAC (Role-Based Access Control), and basic User Management UI.
*   **Sprint 2: PRD Generator Core**
    Develop the 4-step wizard UI. Integrate Gemini API for generating the initial PRD Executive Summary and Features list. Setup PostgreSQL database schema for Projects and Documents.
*   **Sprint 3: UML & ERD Modules**
    Prompt engineering for Mermaid syntax generation. Implement React Mermaid renderer for Use Case, Activity, and Sequence diagrams, as well as Database ERDs.
*   **Sprint 4: Architecture & API Specs**
    Generate High/Low-Level Architecture diagrams and OpenAPI 3.0 specification schemas. Build the Swagger UI viewer within the app.
*   **Sprint 5: Document Library & Templates**
    Develop CRUD operations for PRD templates. Implement the Library view with search, filtering, and version history.
*   **Sprint 6: Exports & Integrations**
    Implement PDF/DOCX export functionalities. Integrate GitHub and Jira API settings for future synchronization.
*   **Sprint 7 & 8: Polish, Performance & Launch**
    Implement Redis caching. Finalize security audits, End-to-End (E2E) testing, UI/UX polish, and deploy to production environments.

---

## 6. Frontend Guidelines

**Architecture & Components**
*   **Pattern:** Container/Presentational pattern. Keep logic in custom hooks or container components, passing simple props to pure UI components.
*   **State:** Use Zustand for global UI state (like sidebar toggle, dark mode) and TanStack Query for server state (caching API responses, loading states, mutations).

**Styling Rules**
*   **Utility-First:** Strictly use Tailwind CSS. Avoid custom `.css` files unless absolutely necessary for external library overrides.
*   **Class Merging:** Use `clsx` and `tailwind-merge` (via a `cn()` utility function) to compose dynamic component classes safely.

**Performance**
*   **Code Splitting:** Lazy-load heavy routes (like the PRD Editor and Mermaid Viewer) using `React.lazy()` and `<Suspense>`.
*   **Memoization:** Optimize expensive renders using `useMemo` for derived states and `useCallback` for heavily passed functions.

---

## 7. Backend Guidelines

**Architecture**
*   **Pattern:** Controller-Service-Repository pattern.
    *   *Controllers:* Handle HTTP requests, input validation, and responses.
    *   *Services:* Contain business logic and third-party integrations (e.g., Gemini AI processing).
    *   *Repositories:* Abstract data access to PostgreSQL.
*   **Validation:** Use Zod or Joi to strictly validate incoming request payloads at the middleware level before reaching the controller.

**API Design**
*   **Standard:** RESTful design principles (e.g., `POST /api/v1/projects/:id/generate`).
*   **Documentation:** Maintain OpenAPI/Swagger definitions alongside route declarations.

---

## 8. Optimized React Code Guidelines

**Preventing Unnecessary Re-Renders**
*   Avoid inline object declarations in dependency arrays of `useEffect` or `useCallback`.
*   *Anti-pattern:* `useEffect(() => fetch(id, { config: {} }), [id])` -> The inline object creates a new reference every render.
*   *Solution:* Extract static configs outside the component or use `useMemo`.

**Handling Mermaid/Heavy DOM Libraries**
*   When utilizing libraries like `mermaid.js`, ensure they are initialized inside a `useEffect` that runs only once on mount, or tied to specific prop changes, avoiding continuous re-parsing on minor state updates.

**State Colocation**
*   Keep state as close to where it's used as possible. Don't put form wizard state in global Zustand if it only matters to the Wizard component; use a local reducer or context provider scoped strictly to the Wizard.

---

## 9. Security Checklist Implementation

*   **Authentication Validation:** All `/api/v1/*` routes (except explicit public ones) must run through a JWT verification middleware.
*   **Authorization (RBAC):** Implement role-checking middleware verifying if the authenticated user's `role` allows the requested `action` on the `module`.
*   **Input Sanitization:** Sanitize all user inputs before sending to the database or rendering in the UI to prevent XSS (Cross-Site Scripting) and SQL Injection. Use parameterized queries (handled by an ORM/Query Builder).
*   **Rate Limiting:** Implement API rate limiting using Redis to prevent abuse of cost-heavy AI generation endpoints.
*   **CORS:** Restrict Cross-Origin Resource Sharing (CORS) to the specific domains of the deployed Vercel frontend.
*   **Data Encryption:** Ensure all connections enforce TLS (HTTPS). Encrypt sensitive fields (like GitHub/Jira API keys) in the database using AES-256 encryption.
