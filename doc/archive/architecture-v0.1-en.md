# Secure AI Agent Architecture

**Version:** v0.1

**Status:** Architecture Proposal

**Document Type:** Architecture Proposal

**Audience:** Engineering Team, Technical Co-founders, Solution Architects

---

# 1. Introduction

## Purpose

This document describes the proposed architecture for a production-grade AI-powered web platform.

The primary design goal is to build a secure, scalable, and maintainable AI application while treating the AI Agent Runtime as an isolated execution engine rather than a trusted backend component.

Although the current implementation uses **Hermes Agent**, the architecture intentionally avoids coupling to any specific agent framework.

This allows the runtime to be replaced in the future without requiring changes to the rest of the system.

---

## Current Runtime

Current implementation:

- Hermes Agent

Possible future replacements:

- OpenAI Agents SDK
- Claude Code
- LangGraph
- Google ADK
- CrewAI
- AutoGen
- Internal Agent Runtime

The architecture should remain unchanged regardless of which runtime is selected.

---

# 2. High-Level Architecture

## Overview

The platform consists of four independent layers.

```
                 Internet
                     │
          Cloudflare / CDN / WAF
                     │
             Frontend Application
             (Next.js / React)
                     │
                HTTPS / REST
                     │
        ┌─────────────────────────────┐
        │                             │
        │      Backend API Server     │
        │                             │
        │ Authentication              │
        │ Authorization               │
        │ Business Logic              │
        │ Workflow                    │
        │ Session                     │
        │ Database Access             │
        │ File Management             │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
 Database & Storage          Agent Execution Server
(Postgres / Redis / S3)      (Hermes Runtime)
                                     │
                         Skills / MCP / Tools
                                     │
                              LLM Providers
```

The Backend serves as the single source of truth.

The Agent Execution Server is responsible only for reasoning and task execution.

It does not own business logic.

---

# 3. Architecture Principles

## Principle 1

### Backend Owns Business Logic

Business logic must never reside inside the AI Agent.

Instead:

Frontend

↓

Backend

↓

Agent

The Backend determines:

- which workflow to execute
- what data to provide
- which tools are available
- how results should be interpreted

The Agent only executes reasoning tasks.

---

## Principle 2

### Runtime Independence

The AI Runtime is considered replaceable.

Business logic must never depend on Hermes-specific APIs.

Instead:

Backend

↓

Agent Interface

↓

Hermes

or

↓

Claude Code

or

↓

OpenAI Agents SDK

The rest of the platform remains unchanged.

---

## Principle 3

### Least Privilege

Every component receives only the permissions required to complete its task.

Example:

Frontend

Can:

- Login
- Upload files
- Display reports

Cannot:

- Access database directly
- Execute AI tools

---

Backend

Can:

- Authenticate users
- Read database
- Access storage
- Manage sessions
- Authorize requests

Cannot:

- Perform AI reasoning

---

Agent Runtime

Can:

- Plan
- Reason
- Call approved tools
- Generate reports

Cannot:

- Authenticate users
- Read production database
- Read secrets
- Access internal services

---

## Principle 4

### Isolation First

The AI Runtime should always execute inside an isolated environment.

Recommended deployment:

Dedicated VM

or

Dedicated Docker Host

or

Dedicated Kubernetes Worker

instead of:

Backend Server

↓

Hermes

running together.

This significantly reduces the impact of prompt injection, supply-chain vulnerabilities, or runtime compromise. Hermes itself documents container isolation and defense-in-depth as core production security practices.  [oai_citation:0‡GitHub](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/security.md?utm_source=chatgpt.com)

---

## Principle 5

### Zero Trust

The AI Runtime is NOT considered trusted.

Instead, it is treated similarly to an external compute service.

Backend

↓

Validate

↓

Sanitize

↓

Call Agent

↓

Validate Again

↓

Persist Result

The Agent never directly modifies production data.

---

# 4. Core Components

## 4.1 Frontend

Responsibilities

- User Interface
- User Authentication UI
- File Upload
- Chat Interface
- Progress Display
- Report Viewer

The Frontend never communicates directly with the AI Runtime.

Instead:

Browser

↓

Backend

↓

Agent

This simplifies authentication while avoiding unnecessary exposure of the Agent API.

---

## 4.2 Backend API Server

The Backend is the central orchestrator.

Responsibilities include:

- Authentication
- Authorization
- Business Logic
- Workflow Orchestration
- Session Management
- Database Access
- Storage Access
- Audit Logging
- Rate Limiting
- Payment
- Subscription
- API Validation
- Calling the Agent Runtime

The Backend owns all sensitive information.

Examples include:

- JWT secrets
- API keys
- Database credentials
- User identity
- Subscription status
- Internal configuration

None of these should ever be exposed to the Agent Runtime.

---

## 4.3 Database & Storage

Persistent storage includes:

- PostgreSQL
- Redis
- Object Storage (S3 or compatible)

Responsibilities:

- User profiles
- Uploaded documents
- Generated reports
- Conversation metadata
- Audit logs
- Job status
- Application configuration

The Agent Runtime should never connect directly to these systems.

All data access must go through Backend APIs.

## 4.4 Agent Execution Server

The Agent Execution Server is responsible for AI reasoning and autonomous task execution.

The current implementation uses **Hermes Agent** as the runtime.

However, the architecture intentionally treats Hermes as a replaceable implementation rather than a core dependency.

### Responsibilities

The Agent Runtime is responsible for:

- Task planning
- Multi-step reasoning
- Tool orchestration
- Skill execution
- MCP integration
- Web search
- Report generation
- Follow-up question generation

The Agent Runtime is **NOT** responsible for:

- User authentication
- Authorization
- Database access
- Persistent storage
- Business workflow decisions
- Billing
- User identity management

### Runtime Capabilities

The runtime may have access to:

- Registered Skills
- Approved MCP Servers
- Approved Toolchains
- Temporary Working Directory
- LLM Providers

The runtime should **not** have access to:

- Production Database
- Redis
- Backend Secrets
- JWT Keys
- Internal Service Credentials
- Payment Systems

For production deployments, Hermes recommends running the runtime inside Docker or another isolated execution backend and exposing it through its OpenAI-compatible API rather than embedding it inside the business application.  [oai_citation:0‡Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/docker/?utm_source=chatgpt.com)

---

# 5. Component Responsibilities

| Component | Primary Responsibilities | Never Responsible For |
|------------|--------------------------|------------------------|
| Frontend | UI, Chat, File Upload, Progress Display | Business Logic, Database Access |
| Backend API | Authentication, Authorization, Workflow, Business Logic, Storage Access | AI Planning |
| Database | Persistent Storage | AI Reasoning |
| Object Storage | User Files, Generated Reports | Authentication |
| Agent Runtime | Planning, Reasoning, Tool Calling, Report Generation | User Identity, Database Access |
| LLM Provider | Language Generation | Business Logic |

---

## Ownership Model

The ownership model is intentionally strict.

### Frontend owns

- User experience
- User interaction

---

### Backend owns

- Business rules
- Workflow orchestration
- User identity
- Persistent data
- Security policies

---

### Agent owns

- Reasoning
- Planning
- Tool execution

Nothing more.

---

# 6. Request Lifecycle

Every request follows the same lifecycle.

```
User

↓

Frontend

↓

Backend

↓

Authentication

↓

Workflow Selection

↓

Agent Runtime

↓

Tool Execution

↓

Result Validation

↓

Database Update

↓

Frontend

↓

User
```

---

## Step 1

The user submits a request.

Example:

> I live in Chengdu and want to apply for a Spanish tourist visa.

---

## Step 2

The Frontend forwards the request to the Backend.

No AI calls are made directly from the browser.

---

## Step 3

The Backend authenticates the user.

The Backend determines:

- User permissions
- Available workflow
- Required tools
- Context

---

## Step 4

The Backend prepares a sanitized Agent Request.

Example:

Instead of

```
User ID: 18273
Email: john@example.com
Subscription: Premium
JWT: xxxx
```

The Agent receives

```
Destination: Spain

Departure:
3 months later

Occupation:
Software Engineer

Monthly Income:
25000 RMB
```

Only information required for reasoning is transmitted.

---

## Step 5

The Agent analyzes the request.

Possible outcomes:

- Enough information
- Missing information
- Need tool execution
- Need external search

---

## Step 6

If more information is required,

The Agent returns structured follow-up questions.

Example:

- Passport expiration date?
- Previous Schengen visa?
- Current employment status?

---

## Step 7

The Backend forwards those questions to the Frontend.

The Frontend never communicates directly with the Agent.

---

## Step 8

The user provides answers.

The Backend validates and forwards them.

---

## Step 9

The Agent executes its plan.

Possible actions include:

- Search embassy requirements
- Generate checklist
- Generate travel plan
- Produce cover letter
- Build timeline

---

## Step 10

The Agent returns structured output.

The Backend validates the output before persisting it.

---

# 7. Agent Execution Flow

```
Receive Request

↓

Analyze Context

↓

Determine Missing Information

↓

Generate Follow-up Questions

↓

Receive Additional Context

↓

Create Execution Plan

↓

Call Tools

↓

Process Tool Results

↓

Generate Final Report

↓

Return Structured Response
```

The Agent never directly updates production systems.

All write operations are performed by the Backend after validation.

---

# 8. Data Flow

## Persistent Data

```
User

↓

Frontend

↓

Backend

↓

Database
```

Persistent user information never flows directly into the Agent Runtime.

---

## Temporary File Processing

```
Upload

↓

Backend

↓

Object Storage

↓

Temporary Copy

↓

Agent Runtime

↓

Processing

↓

Delete Temporary Copy
```

The Agent should never permanently store user documents.

Temporary workspaces should be automatically cleaned after task completion whenever possible. Hermes supports isolated container workspaces and ephemeral execution modes for this purpose.  [oai_citation:1‡GitHub](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/security.md?utm_source=chatgpt.com)

---

## Generated Report

```
Agent

↓

Backend Validation

↓

Object Storage

↓

Frontend
```

The Backend remains the single owner of generated artifacts.

---

# 9. Trust Boundary

The architecture separates the platform into two security zones.

```
────────────────────────────────────────────

Trusted Zone

Frontend

Backend

Database

Object Storage

Redis

Secrets

────────────────────────────────────────────

Trust Boundary

────────────────────────────────────────────

Untrusted Execution Zone

Agent Runtime

Tools

LLM Providers

────────────────────────────────────────────
```

The Agent Runtime is intentionally placed outside the trusted zone.

This design follows the principle that an AI execution engine should be treated as an isolated compute service rather than a trusted application component. Hermes documentation explicitly notes that the operating system (container/VM isolation) is the true security boundary, not the agent process itself.  [oai_citation:2‡GitHub](https://github.com/NousResearch/hermes-agent/blob/main/SECURITY.md?utm_source=chatgpt.com)

---

# 10. Design Decisions

## Decision 1

### Why separate the Agent from the Backend?

To reduce the blast radius of prompt injection, runtime vulnerabilities, or tool abuse.

---

## Decision 2

### Why doesn't the Agent access the database?

Business data should remain under Backend control.

The Agent reasons.

The Backend owns data.

---

## Decision 3

### Why keep business logic outside the Agent?

Business rules must be deterministic.

LLMs should assist decision making—not define system behavior.

---

## Decision 4

### Why make the runtime replaceable?

To avoid vendor lock-in.

Future migrations should require changing only the runtime adapter.

---

## Decision 5

### Why use Backend as the orchestrator?

The Backend already owns:

- Authentication
- Authorization
- Sessions
- Storage
- Logging

It naturally becomes the orchestration layer.

---

# 11. Why This Architecture

## Security

The Agent cannot directly compromise production assets because it never owns them.

---

## Scalability

Multiple Agent Runtime instances can be added without changing business logic.

```
Backend

↓

Load Balancer

↓

Hermes #1

Hermes #2

Hermes #3
```

---

## Maintainability

Each component has a single responsibility.

Changes to one layer rarely affect the others.

---

## Runtime Independence

The runtime may evolve from:

Hermes

↓

Claude Code

↓

OpenAI Agents SDK

↓

Custom Runtime

without redesigning the overall architecture.

---

## Future Expansion

The architecture naturally supports:

- Multiple AI Agents
- Background Jobs
- Human Approval
- Queue Systems
- Distributed Workers
- Agent Marketplace
- Enterprise MCP Integrations

---

# 12. Conclusion

This architecture intentionally separates business systems from AI execution.

Rather than treating the AI Agent as the center of the platform, the architecture treats it as an isolated reasoning engine operating behind a controlled Backend API.

This approach provides:

- Strong security boundaries
- Clear ownership of responsibilities
- Runtime flexibility
- Long-term maintainability
- Enterprise-ready scalability

The resulting system follows a layered architecture where each component has a well-defined responsibility, minimal privileges, and clear trust boundaries.

As the platform evolves, additional capabilities—including multi-agent orchestration, asynchronous workflows, event-driven execution, and enterprise integrations—can be introduced without changing the core architectural principles defined in this document.
