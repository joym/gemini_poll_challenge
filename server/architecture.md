# Backend Architecture

This service follows a layered, stateless backend architecture designed
for civic-grade reliability and auditability.

## Layers
- **Routes**: HTTP interface (Express)
- **Controllers**: Request orchestration
- **Services**: Business logic and AI coordination
- **Security Middleware**: Auth, rate limiting, sanitization
- **Integrations**: Gemini AI, Firebase Auth, Google APIs

## Runtime Model
- Stateless execution
- Horizontally auto-scaled (Cloud Run)
- Deterministic request handling

This architecture minimizes coupling and supports independent testing
of all layers.