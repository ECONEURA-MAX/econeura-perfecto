# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

**DO NOT create public GitHub issues for security vulnerabilities.**

### Contact

Email: security@econeura.com (or create a private GitHub Security Advisory)

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

- **Critical vulnerabilities**: Response within 24 hours
- **High severity**: Response within 72 hours
- **Medium/Low**: Response within 7 days

## Security Measures

### Backend (Node.js)
- **Authentication**: JWT + OAuth 2.0 (Microsoft)
- **Password hashing**: Bcrypt (12 rounds)
- **Rate limiting**: Express rate limiter
- **Input validation**: Joi schemas
- **CORS**: Strict origin validation
- **Security headers**: Helmet.js

### Frontend (React)
- **XSS protection**: React automatic escaping + DOMPurify
- **CSP**: Content Security Policy headers
- **Dependencies**: Automated Snyk scans (GitHub Actions)

### Infrastructure (Azure)
- **TLS**: 1.2+ enforced
- **Secrets**: Azure Key Vault integration
- **Database**: SSL connections only
- **Monitoring**: Application Insights anomaly detection

### CI/CD
- **Dependency scanning**: Snyk (weekly schedule + PR checks)
- **Secret scanning**: GitHub native + Gitleaks
- **Code review**: Required for all PRs to main

## Known Security Considerations

### 1. Mock Database (Development)
- `USE_MOCK_DB=true` is **ONLY for local development**
- Production MUST use Azure PostgreSQL with SSL

### 2. OAuth Secrets Rotation
- Client secrets expire every 24 months
- Automated expiration alerts configured

### 3. Rate Limiting
- API: 100 req/min per IP
- OAuth: 10 attempts/hour per IP

## Compliance

- **GDPR**: User data encryption at rest and in transit
- **Azure Standards**: SOC 2 Type II, ISO 27001
- **PCI DSS**: N/A (no payment processing yet)

## Vulnerability Disclosure Timeline

1. **T+0**: Vulnerability reported
2. **T+24h**: Initial response + severity assessment
3. **T+7d**: Fix developed and tested (critical/high)
4. **T+14d**: Patch deployed to production
5. **T+30d**: Public disclosure (if applicable)

---

**Last updated**: 2025-11-10  
**Maintained by**: ECONEURA Security Team
