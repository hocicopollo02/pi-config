---
description: Revisa la arquitectura de backend con foco en límites, datos, seguridad, escalabilidad y operabilidad
---

Haz una revisión de arquitectura de backend del proyecto actual.

## Objetivo
Evaluar si la arquitectura backend está bien separada, puede escalar con criterio, y reduce riesgo operativo, de seguridad y de mantenimiento.

## Qué revisar
- límites entre capas: route/controller/service/repository/domain
- separación de responsabilidades y acoplamiento entre módulos
- patrones de comunicación entre servicios o módulos
- modelo de datos y decisiones de persistencia
- consistencia transaccional y manejo de concurrencia si aplica
- estrategia de auth/authz y boundary de seguridad
- observabilidad: logs, métricas, tracing, health checks
- resiliencia: retries, timeouts, circuit breakers, colas, degradación
- escalabilidad: hotspots, cuellos de botella, statefulness, puntos únicos de fallo
- mantenibilidad: claridad del diseño, puntos de extensión, deuda estructural

## Inspección sugerida
Usa lo que tenga sentido según el stack:
- entrypoints del backend
- módulos o paquetes principales
- configuración de infraestructura o despliegue si existe
- repositorios / ORMs / migraciones
- colas, workers, cron jobs, eventos
- middlewares, guards, interceptors o equivalentes
- tests arquitectónicos o de integración si existen

## Formato de respuesta
1. **Resumen ejecutivo**
2. **Mapa arquitectónico actual**
3. **Fortalezas**
4. **Riesgos y debilidades**
5. **Problemas estructurales por severidad** (`alta`, `media`, `baja`)
6. **Qué cambiar primero**
7. **Alternativas razonables**
8. **Siguiente paso recomendado**

## Criterios
- Prioriza estructura real del sistema, no teoría de libro.
- Distingue entre defectos de implementación y defectos de arquitectura.
- Señala explícitamente si hay acoplamiento impropio entre capas.
- Si el sistema es simple y suficiente para su escala, dilo; no sobre-arquitectures el análisis.
- No implementes cambios todavía, salvo que el usuario lo pida después.
