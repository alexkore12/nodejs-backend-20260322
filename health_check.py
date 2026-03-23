# Health Check Module for Bot Hidratación

## Descripción
Módulo de health check para el bot de hidratación que permite verificar el estado de los componentes del sistema.

## Características
- Health check del servicio principal
- Verificación de conexión a base de datos
- Verificación de APIs externas
- Endpoint de métricas simple

## Uso

```python
from health_check import HealthChecker

health = HealthChecker()
result = health.check_all()
print(result)
```

## Endpoints
- `GET /health` - Estado general
- `GET /health/ready` - Verificación de preparación
- `GET /health/live` - Verificación de vida

## Configuración
Configurar en `.env`:
```
HEALTH_CHECK_INTERVAL=30
HEALTH_CHECK_TIMEOUT=10
```
