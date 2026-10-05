"""The business logic behind /api/v1, one module per area (ADR-005).

Each mirrors the Next.js service it replaced — the same checks in the same
order, the same keys — so the contract suite that described those services
describes these. Routers call exactly one function here.
"""
