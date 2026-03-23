# 🖥️ Node.js Backend

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-10+-orange.svg)](https://npmjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)

## 📋 Descripción

Backend robusto con Node.js para APIs y servicios. Incluye configuración lista para producción con seguridad, logging y testing.

## ✨ Características

- ⚡ **Node.js 20+**: Runtime moderno con soporte a las últimas características
- 🐳 **Docker**: Multi-stage builds para imágenes optimizadas
- 🔒 **Seguridad**: Helmet.js, validación de entrada, sanitización
- 📊 **Logging**: Winston con rotación de archivos y correlation IDs
- ✅ **Testing Ready**: Estructura completa para tests con Jest
- 📈 **CI/CD**: GitHub Actions para linting, testing y security scanning

## 🚀 Instalación

### Prerequisites

- Node.js 20+
- npm 10+

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/alexkore12/nodejs-backend-20260321.git
cd nodejs-backend-20260321

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu configuración

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### Docker

```bash
# Construir imagen
docker build -t nodejs-backend-20260321 .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env nodejs-backend-20260321
```

### Docker Compose

```bash
docker-compose up -d
```

## ⚙️ Configuración

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno de ejecución | development |
| `LOG_LEVEL` | Nivel de logging | info |
| `API_KEY` | Clave de API (producción) | - |

## 📁 Estructura

```
nodejs-backend-20260321/
├── .dockerignore
├── .env.example
├── .github/workflows/
├── .gitignore
├── .grype.yaml
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── Dockerfile
├── health_check.py
├── LICENSE
├── Makefile
├── README.md
├── SECURITY.md
├── docker-compose.yml
├── index.js          # Entry point
├── package.json
├── scripts/          # Scripts auxiliares
├── security.js       # Funciones de seguridad
└── tests/            # Tests unitarios
```

## 🏗️ API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/status` | Estado del servicio |

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar PRs.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📈 CI/CD

Workflows de GitHub Actions incluidos:
- ✅ Linting con ESLint
- ✅ Tests con Jest
- ✅ Security scanning con Grype
- ✅ Docker build

## 🚨 Troubleshooting

### Puerto en uso

**Problema:** `EADDRINUSE: address already in use`  
**Solución:** Cambia el puerto en .env o杀死 el proceso que usa el puerto.

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Errores de dependencias

**Problema:** `npm install` falla  
**Solución:** Limpia el cache de npm e intenta de nuevo.

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Memory issues

**Problema:** Proceso killed por falta de memoria  
**Solución:** Aumenta la memoria de Node.

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

## 🌐 Referencias

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [Docker Docs](https://docs.docker.com/)
- [Jest Testing](https://jestjs.io/)

## 📝 Licencia

MIT - véase [LICENSE](LICENSE) para detalles.

## 👤 Autor

- **Alex** - [@alexkore12](https://github.com/alexkore12)