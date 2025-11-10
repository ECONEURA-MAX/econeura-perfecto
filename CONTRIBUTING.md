# Contribuyendo a ECONEURA

## 🚀 Setup Desarrollo Local

### Requisitos
- Node.js 20.18.0+ (ver `.nvmrc`)
- npm 10+
- Git
- Azure CLI (opcional, para deploy)

### Instalación

```bash
# 1. Clonar repo
git clone https://github.com/ECONEURA-MAX/econeura-perfecto.git
cd econeura-perfecto

# 2. Backend
cd backend
cp .env.example .env
# Editar .env con tus valores
npm install
npm run dev

# 3. Frontend (terminal separado)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## 📋 Workflow

### Branch Strategy
- `main`: Producción (protegida)
- `develop`: Staging
- `feature/*`: Features nuevas

### Antes de Commit
```bash
# Backend
cd backend
npm run verify  # lint + test

# Frontend
cd frontend
npm run verify  # type-check + lint + test
```

### Commit Messages
Formato: `tipo: descripción breve`

Tipos:
- `feat`: Nueva feature
- `fix`: Bug fix
- `refactor`: Refactoring sin cambio funcional
- `docs`: Documentación
- `test`: Tests
- `chore`: Maintenance

### Pull Request
1. Feature branch desde `develop`
2. Tests pasando
3. Linter clean
4. PR description detallada
5. Review aprobado
6. Merge squash

## 🧪 Testing

```bash
# Backend
npm test                 # Unit tests
npm run test:coverage    # Con coverage
npm run test:ci          # CI mode

# Frontend
npm test                 # Unit tests
npm run test:e2e         # E2E (Playwright)
npm run test:coverage    # Coverage
```

## 📦 Deploy

Deploy automático vía GitHub Actions:
- Push a `main` → Deploy producción
- Push a `develop` → Deploy staging

Scripts manuales en `/scripts`:
- `health-check.ps1`: Verificar servicios
- `smoke-test.ps1`: Tests básicos
- `set-appsettings.ps1`: Configurar Azure

## 🔒 Seguridad

- NO commitear `.env` files
- NO commitear secrets/keys
- Usar Azure Key Vault para producción
- Ejecutar `npm audit` antes de PR

## 📚 Docs

- Backend API: Ver `backend/README.md`
- Frontend: Ver `frontend/README.md`
- Deploy: Ver `.private-docs/`

## ❓ Ayuda

- Issues: GitHub Issues
- Docs privados: `.private-docs/`
