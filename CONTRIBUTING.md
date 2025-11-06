# Contributing to ECONEURA

¡Gracias por tu interés en contribuir a ECONEURA! Este documento proporciona guías para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Empezar](#cómo-empezar)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guías de Estilo](#guías-de-estilo)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)

## 🤝 Código de Conducta

Este proyecto adhiere a un código de conducta profesional. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

## 🚀 Cómo Empezar

### Prerequisitos

- Node.js 20.x o superior
- npm 10.x o superior
- Git
- Cuenta de Azure (para deployment)

### Setup Local

1. **Fork y clona el repositorio:**

```bash
git clone https://github.com/tu-usuario/econeura-perfecto.git
cd econeura-perfecto
```

2. **Instala dependencias:**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configura variables de entorno:**

```bash
# Backend
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales

# Frontend
cp frontend/.env.example frontend/.env
```

4. **Ejecuta tests:**

```bash
# Backend
cd backend
npm test

# Frontend
cd ../frontend
npm test
```

## 🔄 Proceso de Desarrollo

### Workflow de Git

1. Crea una branch desde `main`:

```bash
git checkout -b feature/mi-nueva-feature
```

2. Haz commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: añadir nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorización de código
test: añadir tests
chore: tareas de mantenimiento
```

3. Push y crea Pull Request:

```bash
git push origin feature/mi-nueva-feature
```

### Tests

**Todos los cambios deben incluir tests.** Asegúrate de:

- Mantener cobertura de tests >80%
- Tests unitarios para lógica de negocio
- Tests de integración para APIs

```bash
# Ejecutar todos los tests
cd backend && npm test

# Ver cobertura
npm test -- --coverage
```

## 📝 Guías de Estilo

### JavaScript/TypeScript

- Usa ESLint para mantener consistencia
- Sigue Airbnb Style Guide
- Usa `async/await` en lugar de callbacks
- Documenta funciones complejas con JSDoc

### Commits

```
<tipo>(<scope>): <descripción corta>

<descripción detallada opcional>

<footer opcional>
```

Ejemplos:
```
feat(auth): implementar refresh tokens
fix(neura): corregir timeout en invocación
docs(api): actualizar endpoints de health
```

### Nombres

- **Variables**: camelCase (`userToken`, `apiKey`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)
- **Funciones**: camelCase (`getUserData`, `validateToken`)
- **Clases**: PascalCase (`AuthService`, `NeuraAgent`)
- **Archivos**: kebab-case (`auth-middleware.js`, `user-service.js`)

## 🔍 Pull Requests

### Checklist

Antes de crear un PR, verifica:

- [ ] Tests pasan (`npm test`)
- [ ] Sin warnings de linter (`npm run lint`)
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado (si aplica)
- [ ] Commits siguen Conventional Commits
- [ ] Branch actualizada con `main`

### Descripción de PR

Usa esta plantilla:

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Testing
- [ ] Tests unitarios añadidos
- [ ] Tests de integración añadidos
- [ ] Tests manuales realizados

## Screenshots (si aplica)
[Añadir capturas si hay cambios visuales]
```

### Revisión

- Se requiere al menos 1 aprobación
- CI/CD debe pasar (tests, linting, build)
- Resuelve todos los comentarios

## 🐛 Reportar Bugs

Usa GitHub Issues con esta plantilla:

```markdown
**Descripción del Bug**
[Descripción clara del problema]

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer click en '...'
3. Ver error

**Comportamiento Esperado**
[Lo que debería pasar]

**Comportamiento Actual**
[Lo que realmente pasa]

**Screenshots**
[Si aplica]

**Entorno**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Versión: [e.g., 3.2.0]

**Contexto Adicional**
[Información relevante]
```

## 🎯 Prioridades

### High Priority

- Security vulnerabilities
- Production bugs
- Performance issues

### Medium Priority

- Feature requests
- UX improvements
- Documentation

### Low Priority

- Code style
- Refactoring
- Nice-to-have features

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/ECONEURA-MAX/econeura-perfecto/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ECONEURA-MAX/econeura-perfecto/discussions)
- **Email**: contacto@econeura.com

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licenciarán bajo la misma licencia del proyecto (Proprietary License).

---

¡Gracias por contribuir a ECONEURA! 🚀

