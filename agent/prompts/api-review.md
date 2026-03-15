---
description: Revisa diseño y calidad de APIs con foco en contratos, validación, errores y compatibilidad entre capas
---

Haz una revisión de diseño de API del proyecto actual.

## Objetivo
Evaluar si la capa API está bien diseñada, es consistente, segura y mantenible, y si su contrato entre capas está suficientemente claro.

## Qué revisar
- endpoints, handlers, controllers o routes
- diseño de recursos y naming
- contratos request/response
- versionado o estrategia de evolución del contrato
- validación de entrada y salida
- manejo de errores y códigos HTTP
- auth/authz si aplica
- consistencia entre cliente, servidor y schemas
- serialización / transformación de datos
- compatibilidad hacia atrás si hay consumidores existentes
- documentación ejecutable o especificación OpenAPI/Swagger si existe
- cohesión de responsabilidades entre route/controller/service/repository

## Inspección sugerida
Usa lo que tenga sentido según el stack:
- rutas/endpoints
- schemas o validators
- servicios/use-cases
- clientes API
- tests de integración o contract tests si existen
- tipos compartidos entre frontend y backend si existen
- documentación de API y ejemplos curl si existen

## Formato de respuesta
1. **Resumen ejecutivo**
2. **Hallazgos clave**
3. **Riesgos por severidad** (`alta`, `media`, `baja`)
4. **Problemas de contrato o integración entre capas**
5. **Problemas de diseño de API**
6. **Qué arreglar primero**
7. **Validaciones o tests recomendados**
8. **Siguiente paso recomendado**

## Criterios
- No te quedes en teoría arquitectónica genérica.
- Prioriza contratos rotos, errores silenciosos, validación insuficiente, códigos HTTP inconsistentes y deuda de integración.
- Distingue claramente entre problemas locales y sistémicos.
- Si algo está bien diseñado, dilo sin forzar hallazgos.
- No implementes cambios todavía, salvo que el usuario lo pida después.
