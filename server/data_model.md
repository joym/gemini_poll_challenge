# Data & State Model

The system uses explicit, intentional state separation.

## Identity
- Firebase Authentication is the source of truth
- No local credential persistence

## Session State
- JWT-bound
- Stateless by design
- Request-scoped only

## Civic Interaction State
- Poll computation is deterministic
- Results are reproducible from inputs
- No hidden mutable state

## AI Inference State
- Stateless per request
- Prompt + response auditable
- No model fine-tuning on user data

This model supports neutrality, replayability, and governance review.