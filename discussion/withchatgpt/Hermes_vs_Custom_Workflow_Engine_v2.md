# Hermes vs. Custom Workflow Engine (v2)

## Executive Summary

For the current visa preparation platform, a custom workflow engine is
likely a better fit than adopting Hermes as the core runtime.

The product is primarily a **business workflow** rather than an
**autonomous AI agent**.

Recommended roadmap:

-   V1: Custom Workflow Engine + LLM APIs
-   V2: Add Memory
-   V3: Add Tool Registry
-   V4: Add Skills
-   V5: Evaluate Hermes only when complexity justifies it

------------------------------------------------------------------------

# Business Workflow vs Autonomous Agent

## Business Workflow

-   Fixed process
-   Known states
-   Deterministic transitions

Typical flow:

Collect Information → Validate → Ask User → Search → Generate Report →
Done

## Autonomous Agent

-   Dynamic planning
-   Long-running tasks
-   Persistent memory
-   Self-directed tool usage

Hermes is primarily designed for this category.

------------------------------------------------------------------------

# What Hermes Provides

-   Tool Registry
-   Tool Calling Infrastructure
-   Persistent Memory
-   Skills
-   Multi-provider Routing

These are valuable platform capabilities but are not unique to Hermes.

------------------------------------------------------------------------

# What Is Not Unique

Hermes does not uniquely provide:

-   Loops
-   State Machines
-   Business Workflows
-   Follow-up Questions
-   API Orchestration

All of these can be implemented inside backend code.

------------------------------------------------------------------------

# Recommended Architecture

Frontend ↓ Backend ↓ Workflow Engine ↓ LLM API

Business logic remains inside the Backend.

------------------------------------------------------------------------

# Why a Custom Workflow Can Be Faster

## Key Insight

Hermes is not slower because of Python.

Hermes is slower because it performs many framework-level operations
required by a general-purpose autonomous agent.

Typical overhead includes:

-   Agent loop iterations
-   Prompt construction
-   Tool registry lookup
-   Memory management
-   Context compression
-   Retry logic
-   Provider routing

These features are useful for open-ended agents but unnecessary for many
deterministic workflows.

------------------------------------------------------------------------

## Fewer LLM Calls

Many decisions can be implemented directly in code.

Example:

Instead of asking an LLM:

"Should I ask for the passport?"

Backend logic simply checks:

if passport is missing: ask for passport

No LLM call. No extra latency. No token cost.

------------------------------------------------------------------------

## Business Rules Stay in Code

The Backend already knows visa requirements.

For example:

Spain requires:

-   Passport
-   Bank Statement
-   Employment Letter

The Backend can determine missing documents immediately.

The LLM only converts structured results into natural language.

------------------------------------------------------------------------

## Parallel Execution

A custom workflow engine can execute independent tasks simultaneously.

Examples:

-   OCR
-   Embassy search
-   Template generation
-   Translation

These tasks can run in parallel before invoking the LLM for synthesis.

------------------------------------------------------------------------

## Caching

Frequently requested information can be cached.

Examples:

-   Embassy requirements
-   Country-specific checklists
-   Document templates

This avoids repeated searches and repeated LLM calls.

------------------------------------------------------------------------

## Smaller Prompts

General-purpose agent frameworks often include:

-   Tool definitions
-   Memory
-   Skills
-   Runtime instructions

A custom workflow can use much smaller prompts focused only on the
current task.

Smaller prompts reduce:

-   Token usage
-   Cost
-   Latency

------------------------------------------------------------------------

# Workflow-centric vs Agent-centric Products

## Workflow-centric Products

Examples:

-   Visa preparation
-   Tax filing
-   Insurance claims
-   Appointment scheduling
-   Legal document generation

Recommended architecture:

Code controls workflow. LLM provides intelligence.

------------------------------------------------------------------------

## Agent-centric Products

Examples:

-   AI coding assistant
-   Research agent
-   Autonomous personal assistant
-   AI operations platform

Recommended architecture:

General-purpose Agent Runtime (Hermes, OpenAI Agents SDK, LangGraph,
etc.)

------------------------------------------------------------------------

# Final Recommendation

For the current startup:

-   Build a custom Workflow Engine first.
-   Keep business logic inside the Backend.
-   Use LLM APIs only for reasoning and generation.
-   Optimize latency through deterministic code, parallel execution,
    caching, and small prompts.
-   Introduce Hermes only when autonomous agent capabilities become a
    genuine product requirement.
