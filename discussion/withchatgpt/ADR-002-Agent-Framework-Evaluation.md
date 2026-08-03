# ADR-002: Agent Framework Evaluation

**Status:** Accepted (Current Architecture) **Version:** 1.0 **Decision
Date:** 2026-08-03

# Executive Summary

This document evaluates whether the platform should adopt a
general-purpose Agent Runtime (such as Hermes) or implement a custom
Workflow Engine.

**Decision**

For the current visa preparation platform, we will build a custom
Workflow Engine and use LLM APIs as intelligence services.

General-purpose Agent Runtimes remain future options but are not adopted
in Version 1.

------------------------------------------------------------------------

# Problem Statement

The product must:

-   Collect user information
-   Ask follow-up questions
-   Search official resources
-   Generate reports
-   Produce supporting documents

The question is whether these capabilities require a full Agent Runtime
or can be implemented using backend workflow orchestration.

------------------------------------------------------------------------

# Business Context

The platform is a Workflow-centric product rather than an Agent-centric
product.

Typical flow:

Collect Information → Validate → Ask User → Search → Generate Documents
→ Finish

The workflow is predictable and driven by business rules.

------------------------------------------------------------------------

# Candidate Solutions

## Option A -- Custom Workflow Engine

Backend maintains a deterministic state machine.

LLMs are invoked only when reasoning or language generation is required.

## Option B -- Hermes Agent

Hermes acts as the runtime responsible for planning, reasoning, tool
execution, memory, and workflow.

## Option C -- OpenAI Agents SDK

Provides OpenAI-managed agent abstractions.

## Option D -- LangGraph

Graph-based orchestration framework.

## Option E -- Claude Code / Other Agent Frameworks

General-purpose autonomous agent runtimes.

------------------------------------------------------------------------

# Evaluation Criteria

1.  Performance
2.  Latency
3.  Cost
4.  Security
5.  Maintainability
6.  Debuggability
7.  Flexibility
8.  Vendor Lock-in
9.  Enterprise Readiness
10. Development Complexity

------------------------------------------------------------------------

# Comparison Matrix

  Criterion               Custom Workflow   Hermes
  ----------------------- ----------------- -----------
  Performance             Excellent         Good
  Latency                 Excellent         Moderate
  Cost                    Excellent         Moderate
  Security                Excellent         Good
  Debugging               Excellent         Moderate
  Maintainability         Excellent         Good
  Runtime Flexibility     Excellent         Moderate
  Vendor Lock-in          Very Low          Moderate
  Autonomous Capability   Moderate          Excellent
  Initial Development     Moderate          Low

------------------------------------------------------------------------

# Technical Analysis

## Why Custom Workflow is Faster

Hermes performs additional runtime operations including:

-   Agent loop
-   Prompt assembly
-   Tool discovery
-   Memory management
-   Provider routing
-   Retry handling

These capabilities are valuable for autonomous agents but introduce
overhead.

A workflow engine executes only the required business logic.

------------------------------------------------------------------------

## Minimize LLM Calls

Instead of asking an LLM:

Should I ask for the passport?

The backend checks:

-   passport uploaded?
-   employment uploaded?
-   bank statement uploaded?

Business validation becomes deterministic code.

------------------------------------------------------------------------

## Parallel Execution

Independent tasks can execute simultaneously:

-   OCR
-   Embassy search
-   Translation
-   Template generation

The LLM synthesizes results afterward.

------------------------------------------------------------------------

## Caching

Frequently used information should be cached:

-   Embassy requirements
-   Country rules
-   Templates

This reduces latency and API cost.

------------------------------------------------------------------------

## Smaller Prompts

Custom workflows send only task-specific prompts.

General agent runtimes often include:

-   Tool schemas
-   Memory
-   Runtime instructions
-   Skills

Smaller prompts reduce:

-   Tokens
-   Cost
-   Latency

------------------------------------------------------------------------

# Workflow-centric vs Agent-centric

## Workflow-centric

Examples:

-   Visa preparation
-   Tax filing
-   Insurance
-   Legal forms

Recommendation:

Code controls workflow.

LLM provides intelligence.

## Agent-centric

Examples:

-   Coding assistant
-   Research assistant
-   Autonomous operations

Recommendation:

General-purpose Agent Runtime.

------------------------------------------------------------------------

# Risks

## Custom Workflow

Pros

-   Predictable
-   Fast
-   Easy to debug
-   Easy to audit

Cons

-   More code to maintain
-   Some infrastructure must be built internally

## Hermes

Pros

-   Rich ecosystem
-   Memory
-   Skills
-   Autonomous execution

Cons

-   Higher latency
-   Less deterministic
-   More operational complexity

------------------------------------------------------------------------

# Architecture Recommendation

Frontend

↓

Backend

↓

Workflow Engine

↓

LLM Services

The Backend owns:

-   Business rules
-   State
-   Security
-   Authentication
-   Storage

The LLM provides reasoning only.

------------------------------------------------------------------------

# Future Evolution

V1

Workflow Engine

V2

Memory

V3

Tool Registry

V4

Skills

V5

Evaluate Hermes or another Agent Runtime when autonomous execution
becomes a product requirement.

------------------------------------------------------------------------

# Final Decision

The platform will implement a custom Workflow Engine.

Reasons:

-   Better performance
-   Lower latency
-   Lower operational complexity
-   Better control
-   Stronger security boundaries
-   Easier debugging
-   Runtime independence

General-purpose Agent Frameworks remain compatible with the architecture
and may be introduced in future versions if business requirements
evolve.

------------------------------------------------------------------------

End of ADR-002
