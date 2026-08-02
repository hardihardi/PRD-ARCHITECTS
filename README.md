# AI-Powered PRD Generator & Real-Time Collaboration Platform

An enterprise-grade, intelligent **Product Requirement Document (PRD) Generator** built with **React**, **TypeScript**, **Tailwind CSS**, **Express.js**, and **Google Gemini 2.5 Flash**.

This platform streamlines product management workflows by automating PRD creation, analyzing complex specification documents, enabling real-time multi-user collaboration, and integrating directly with project management systems like **Jira** and **Asana**.

---

## 🌟 Key Features

### 1. 🤖 AI Document Analyzer & Requirements Extractor
- **File & Text Processing**: Supports uploading `.docx` (Microsoft Word), `.txt`, `.md`, or pasting unstructured project notes.
- **Automated Entity Extraction**: Extracts project names, industry domains, target personas, problem statements, and primary objectives using **Gemini 2.5 Flash**.
- **Requirement Categorization**: Automatically categorizes requirements into **Functional Requirements (FR)** with priority tags (High/Medium/Low) and **Non-Functional Requirements (NFR)** (Performance, Security, Scalability).
- **Domain Keyword & Tech Stack Mapping**: Extracts domain-specific vocabulary and suggests suitable technical stack architectures with detailed rationales.
- **One-Click Wizard Auto-Fill**: Ingests extracted metadata directly into the PRD Generator Wizard to save hours of manual typing.

### 2. ⚡ Real-Time Multi-User Collaboration
- **Live Presence Indicators**: Displays real-time collaborator avatars, active status, and active color coding.
- **Cursor & Section Tracking**: Shows which PRD section each team member is currently viewing or editing (e.g., *Viewing: Executive Summary*, *Editing: System Architecture*).
- **Threaded Commenting System**:
  - Quote specific PRD text for context-aware feedback.
  - Multi-level reply threads for detailed team discussions.
  - Filter comments by *All*, *Active*, or *Resolved*.
  - Mark comments as resolved with auditor timestamps.

### 3. 📝 Multi-Step PRD Generator Wizard
- **Tailored Workflows**: Supports diverse project archetypes including SaaS Applications, E-commerce Platforms, Super Apps, Microservices Architectures, Mobile Apps, and AI Tools.
- **Framework Support**: Custom templates for **Agile**, **Waterfall**, **Lean Startup**, and **Shape Up** methodologies.
- **Comprehensive Fields**: Captures technical parameters, budget, team size, SLA/latency targets, and target user personas.

### 4. 🛠️ Interactive PRD Editor & AI Assistant
- **Section-by-Section Editing**: Live markdown preview and rich text formatting.
- **AI Feedback Widget**: Evaluates completeness, clarity, and technical feasibility per section with real-time score indicators.
- **Version Control & History**: Snapshot saving and version restoration.
- **Integrations**: Push generated user stories and epics directly to **Jira** and **Asana** via REST API integrations.

### 5. 🌍 Internationalization (i18n) & Multi-LLM Provider Support
- **Multi-Language UI**: Built-in support for English and Indonesian.
- **Flexible LLM Endpoints**: Primary integration with **Google Gemini (2.5 Flash / 2.5 Pro / 2.0 Flash)** with fallback support for OpenAI, Claude, Xiaomi AI, and Z.ai endpoints.

---

## 🏗️ Architecture & Tech Stack

```
   ┌──────────────────────────────────────────────────────────────┐
   │                   React 18 + Vite Frontend                   │
   │  (Tailwind CSS, Lucide Icons, Framer Motion, Mammoth Parser) │
   └──────────────────────────────┬───────────────────────────────┘
                                  │ HTTP / REST & Firebase SDK
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                Express.js Server (Node.js)                   │
   │    Handles AI Proxying, Document Ingestion, PM Sync APIs     │
   └──────────────┬──────────────────────────────┬────────────────┘
                  │                              │
                  ▼                              ▼
     ┌─────────────────────────┐    ┌──────────────────────────┐
     │    Google Gemini API    │    │ Firebase Firestore & Auth│
     │  (Gemini 2.5 Flash SDK) │    │  (Presence & Comments)   │
     └─────────────────────────┘    └──────────────────────────┘
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion (`motion/react`), Mammoth.js, Radix UI.
- **Backend**: Express.js server running in ESM/TypeScript mode via `tsx` (dev) and bundled CJS via `esbuild` (production).
- **Database & Auth**: Firebase Firestore (real-time document listeners for presence & comments) and Firebase Authentication.
- **AI Engine**: Google Gen AI SDK (`@google/genai`).

---

## 📁 Directory Structure

```
.
├── server.ts                    # Main Express backend server & API endpoints
├── src/
│   ├── main.tsx                 # React application entry point
│   ├── App.tsx                  # Root component & client-side router
│   ├── pages/                   # Application views
│   │   ├── Dashboard.tsx        # Analytics overview & quick actions
│   │   ├── GenerateWizard.tsx   # Multi-step PRD creation wizard + Doc Analyzer
│   │   ├── Library.tsx          # Saved PRD documents & templates
│   │   ├── LibraryDetail.tsx    # Live PRD editor, presence & comments
│   │   └── Settings.tsx       # API keys & configuration
│   ├── components/
│   │   ├── prd/
│   │   │   ├── PRDDocumentAnalyzer.tsx  # Document upload & AI requirements extractor
│   │   │   ├── PRDPresence.tsx          # Real-time multi-user cursor tracking
│   │   │   ├── PRDCollabPanel.tsx       # Threaded commenting & version history
│   │   │   ├── PRDSectionEditor.tsx     # Section editor with AI feedback
│   │   │   └── PushPMToolModal.tsx      # Jira & Asana sync modal
│   │   └── ui/                      # Reusable UI controls (Buttons, Dialogs, etc.)
│   └── contexts/                # React contexts (Auth, i18n, Theme)
├── .env.example                 # Environment variables template
├── package.json                 # Node.js dependencies & scripts
└── vite.config.ts               # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` installed on your machine.
- **npm** or **bun** package manager.
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-organization/prd-generator.git
   cd prd-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and supply your keys:
   ```bash
   cp .env.example .env
   ```

   In `.env`:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   PORT=3000
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## 💻 Building for Production

To create an optimized production build:

```bash
npm run build
```

This command will:
1. Compile client assets into the `dist/` directory using Vite.
2. Bundle `server.ts` into a self-contained CommonJS file at `dist/server.cjs` using `esbuild`.

To start the production server:

```bash
npm start
```

---

## 📖 Usage Workflow Guide

### A. Generating a PRD from an Existing Document
1. Navigate to **Generate PRD** from the sidebar.
2. Click **Open AI Doc Analyzer**.
3. Choose either **Upload Document** (`.docx`, `.txt`, `.md`) or **Paste Specification Text**.
4. Click **Start AI Extraction & Analysis**.
5. Review the extracted executive summary, functional requirements, and persona insights.
6. Click **Auto-Fill PRD Generator** to populate the wizard forms instantly.
7. Click **Generate PRD** to produce a complete PRD document.

### B. Real-Time Collaboration
1. Open any generated PRD in the **Library**.
2. Share the PRD URL with team members logged into the platform.
3. Observe active collaborators in the top-right **Presence Bar**.
4. Select any text block in a PRD section to quote and post a **Comment**.
5. Team members can reply to threads, resolve comments, or restore previous versions from the **Collaboration Panel**.

### C. Syncing with Jira or Asana
1. Inside the PRD Detail view, click **Push to PM Tool**.
2. Enter your Jira domain/API Token or Asana Personal Access Token.
3. Select the target project board to auto-create user stories and tasks directly from your PRD requirements.

---

## 🔒 Security & Best Practices
- **Server-Side API Proxying**: API keys (such as `GEMINI_API_KEY`) are kept exclusively on the Express backend and are never exposed to the client bundle.
- **Optimized Fallbacks**: Automatic fallback handling ensures continuous operation across model endpoints (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`).
- **Data Privacy**: Uploaded documents are parsed in-memory and processed securely via official SDKs.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to customize and extend it for your organization's product management needs!
