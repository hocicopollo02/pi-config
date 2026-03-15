---
description: Revisa performance de APIs con foco en latencia, throughput, consultas, cache y degradación bajo carga
---

Haz una revisión de performance de APIs del proyecto actual.

## Objetivo
Evaluar si la capa API tiene riesgos de rendimiento, latencia y escalabilidad, y detectar los cuellos de botella más probables.

## Qué revisar
- latencia y distribución de tiempos si existen métricas (P50, P95, P99)
- throughput esperado y comportamiento bajo carga
- consultas lentas, N+1, joins caros, scans e índices ausentes
- connection pooling y uso de recursos
- serialización/deserialización costosa
- caching: dónde existe, dónde falta y dónde sería peligroso
- payloads excesivos, overfetching/underfetching
- fan-out a servicios externos y dependencia de terceros
- timeouts, retries, backpressure y degradación bajo sobrecarga
- oportunidades de streaming, paginación, batching o colas

## Inspección sugerida
Usa lo que tenga sentido según el stack:
- métricas o dashboards si existen
- código de endpoints críticos
- acceso a datos / queries / repositorios / ORM
- configuración de cache, workers, queues o rate limiting
- tests de carga o benchmarks si existen
- documentación de SLAs o budgets de performance si existe

## Formato de respuesta
1. **Resumen ejecutivo**
2. **Hot paths identificados**
3. **Riesgos de performance por severidad** (`alta`, `media`, `baja`)
4. **Bottlenecks probables**
5. **Qué medir primero**
6. **Qué optimizar primero**
7. **Validaciones o benchmarks recomendados**
8. **Siguiente paso recomendado**

## Criterios
- No inventes métricas que no existan; si faltan, dilo y propone qué medir.
- Prioriza causas raíz sobre micro-optimizaciones cosméticas.
- Conecta rendimiento de API con base de datos, red, terceros y diseño del contrato.
- Si no hay evidencia suficiente, formula hipótesis explícitas, no conclusiones disfrazadas.
- No implementes cambios todavía, salvo que el usuario lo pida después.
