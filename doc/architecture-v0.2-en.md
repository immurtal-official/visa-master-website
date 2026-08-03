# Secure AI Agent Architecture (v0.2)

**Version:** v0.2\
**Status:** Architecture Proposal

## 1. Overview

This document proposes a secure, production-oriented architecture for
AI-powered web applications. The core philosophy is:

> **The AI Agent is treated as an isolated execution engine rather than
> a trusted business service.**

The current runtime is **Hermes Agent**, but the architecture is
runtime-independent and can later support OpenAI Agents SDK, Claude
Code, LangGraph, Google ADK, or a custom runtime.

------------------------------------------------------------------------

## 2. Architecture Principles

-   Backend owns business logic.
-   Agent owns reasoning.
-   Least privilege.
-   Zero Trust.
-   Runtime independence.
-   Isolation first.

------------------------------------------------------------------------

## 3. Assumptions

  Item                    Value
  ----------------------- ------------------------
  Current Agent Runtime   Hermes Agent
  Backend                 FastAPI / ASP.NET Core
  Frontend                React / Next.js
  Database                PostgreSQL
  Object Storage          S3-compatible
  Cache                   Redis

------------------------------------------------------------------------

## 4. High-Level Architecture

``` mermaid
flowchart TB

Internet --> CDN["Cloudflare / CDN / WAF"]
CDN --> FE["Frontend (React / Next.js)"]
FE --> BE["Backend API"]

subgraph Trusted["Trusted Zone"]
BE
DB["PostgreSQL"]
REDIS["Redis"]
OBJ["Object Storage"]
BE --> DB
BE --> REDIS
BE --> OBJ
end

BE --> AGENT

subgraph Untrusted["Agent Execution Zone"]
AGENT["Agent Execution Server\n(Hermes Runtime)"]
TOOLS["Skills / MCP / Tools"]
LLM["LLM Providers"]
AGENT --> TOOLS
AGENT --> LLM
end
```

The Backend is the system orchestrator and the single source of truth.

------------------------------------------------------------------------

## 5. Core Components

### Frontend

Responsibilities: - User interface - Chat - Upload - Report display

### Backend

Responsibilities: - Authentication - Authorization - Workflow - Business
logic - Storage - Session - Validation - Agent orchestration

### Database & Storage

Responsibilities: - User data - Reports - Metadata - Logs

### Agent Execution Server

Responsibilities: - Planning - Reasoning - Tool calling - Report
generation

Not responsible for: - Authentication - Database - Secrets - Persistent
storage

------------------------------------------------------------------------

## 6. Component Responsibilities

  Component   Owns              Never Owns
  ----------- ----------------- ---------------
  Frontend    UI                Database
  Backend     Business Logic    AI Reasoning
  Agent       Planning          User Identity
  Database    Persistent Data   AI Logic

------------------------------------------------------------------------

## 7. Request Lifecycle

``` mermaid
sequenceDiagram

participant User
participant Frontend
participant Backend
participant Agent

User->>Frontend: Submit request
Frontend->>Backend: API request
Backend->>Agent: Sanitized task
Agent-->>Backend: Questions / Result
Backend-->>Frontend: Response
Frontend-->>User: Display
```

------------------------------------------------------------------------

## 8. Agent Execution Flow

``` mermaid
flowchart TD

A[Receive Request]
-->B[Analyze Context]
-->C[Need More Information?]
-->D[Generate Questions]
-->E[Receive Answers]
-->F[Plan Tasks]
-->G[Call Tools]
-->H[Generate Report]
-->I[Return Structured Output]
```

------------------------------------------------------------------------

## 9. Data Flow

``` mermaid
flowchart LR

User --> Frontend --> Backend --> Storage

Backend --> Temp["Temporary Workspace"]

Temp --> Agent

Agent --> Backend

Backend --> Storage
```

User documents remain under Backend control. The Agent only processes
temporary copies.

------------------------------------------------------------------------

## 10. Trust Boundary

``` mermaid
flowchart TB

subgraph Trusted
Frontend
Backend
Database
Storage
Secrets
end

Boundary["Trust Boundary"]

subgraph Untrusted
Agent
Tools
LLM
end

Trusted --> Boundary --> Untrusted
```

------------------------------------------------------------------------

## 11. Architecture Decision Records

### ADR-001

**Decision:** Isolate the Agent Runtime.

**Reason:** Reduce blast radius.

------------------------------------------------------------------------

### ADR-002

**Decision:** Backend owns all business logic.

**Reason:** Deterministic behavior.

------------------------------------------------------------------------

### ADR-003

**Decision:** Runtime is replaceable.

**Reason:** Avoid vendor lock-in.

------------------------------------------------------------------------

## 12. Risks & Trade-offs

Advantages:

-   Strong security
-   Runtime flexibility
-   Clear ownership
-   Easy scaling

Trade-offs:

-   Additional network hop
-   More orchestration logic
-   Slightly higher latency

------------------------------------------------------------------------

## 13. Future Extensions

-   Multi-agent orchestration
-   Background jobs
-   Human approval
-   Queue systems
-   Event-driven execution
-   Enterprise MCP

------------------------------------------------------------------------

## 14. Out of Scope

-   Authentication implementation
-   Storage implementation
-   Billing
-   Monitoring
-   Deployment automation

------------------------------------------------------------------------

## 15. Conclusion

This architecture separates AI execution from business systems. The
Backend remains the trusted control plane, while the Agent Runtime
serves as an isolated reasoning engine. This provides a secure,
scalable, maintainable, and runtime-independent foundation suitable for
production AI applications.
