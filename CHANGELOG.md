# Changelog

All notable changes to ECONEURA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Middleware: `requestId.js` for distributed tracing
- Middleware: `securityHeaders.js` (HSTS, XSS protection, CSP)
- Middleware: `cacheHeaders.js` for static asset optimization
- Utils: `errorHandler.js` centralized error handling
- Config: `database.optimized.js` with connection pooling
- Docs: `CONTRIBUTING.md` for contributors
- Docs: `SECURITY.md` for vulnerability reporting
- Tests: Increased coverage to 81% backend, 78% frontend
- CI/CD: Automated linting + formatting checks

### Changed
- Refactored API detection (centralized in `frontend/src/config/api.ts`)
- Fixed hardcoded AI models in 11 NEURA prompts (now use `process.env.OPENAI_MODEL`)
- Centralized logging (Winston) across all backend routes
- Optimized frontend bundle size: 248 KB gzipped (was 310 KB)

### Removed
- Dead code: `advancedVoiceService.js` (447 lines)
- Dead code: `realTimeStreamingService.js` (478 lines)
- Dead code: `automationService` (unused global)
- Dead code: `web.config` (IIS config irrelevant for Linux)
- Duplicates: Consolidated chat routes (`api/chats.js` → `routes/chat.js`)
- Duplicates: Removed duplicate invoke endpoints
- Demo users hardcoded credentials (security risk)
- Unnecessary: `v3-config.json.bak`
- P3 features: Offline support, i18n (not production-critical)

### Fixed
- **CRITICAL**: `backend/api/agents.js` - removed duplicate `module.exports`
- **CRITICAL**: `backend/routes/ai-gateway.js` - added missing `db` import
- **CRITICAL**: `backend/server.js` - removed `require()` for deleted services
- Redis mock implementation for development
- OAuth callback format mismatch (backend/frontend alignment)
- Mammouth AI integration (baseURL configuration)

### Security
- All OAuth secrets rotated (2025-11-06)
- Rate limiting enforced on all API endpoints
- Security headers middleware (HSTS, noSniff, frameguard)
- Snyk scans enabled in GitHub Actions

## [1.0.0] - 2025-11-06

### Added
- Initial production release
- 10 NEURA agents (CEO, CTO, CFO, Legal, HR, Ops, Supply, Marketing, Security, M&A)
- Microsoft OAuth authentication
- Azure deployment (App Service + Static Web Apps)
- PostgreSQL 16 database schema
- Redis caching layer
- GitHub Actions CI/CD pipelines
- Winston structured logging
- Comprehensive health checks (`/api/health`)

### Infrastructure
- Azure subscription: `fc22ced4-6dc1-4f52-aac1-170a62f98c57`
- Backend: `econeura-backend-prod.azurewebsites.net` (Node 20, B1 plan)
- Frontend: `econeura.com` (Azure Static Web Apps)
- Database: PostgreSQL 16 Flexible Server (B1ms)
- Cache: Redis 7 (C0 tier)

---

## Release Notes Template (for future versions)

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Features marked for removal

### Removed
- Features removed in this version

### Fixed
- Bug fixes

### Security
- Security improvements
```

---

**Maintained by**: ECONEURA Team  
**Last updated**: 2025-11-10
