---
description: Traza un flujo API end-to-end desde cliente hasta respuesta y explica sus puntos frágiles
---

Traza el flujo API `$@` dentro del proyecto actual.

## Objetivo
Seguir una interacción API de extremo a extremo para entender cómo viajan los datos y dónde están los riesgos.

## Instrucciones
1. Usa el argumento del comando como flujo o caso a rastrear.
2. Localiza primero las piezas más probables con herramientas rápidas (`rg`, `fd`, `bat`).
3. Sigue el flujo a través de las capas relevantes, por ejemplo:
   - llamada desde frontend, SDK o cliente
   - cliente API / fetcher / wrapper HTTP
   - endpoint / route / controller / handler
   - schema o validación
   - service / use-case
   - acceso a datos / repositorio / ORM
   - serialización de respuesta
   - manejo de errores y códigos HTTP
4. Si hay auth, permisos, idempotencia, cache o side effects, inclúyelos.
5. Si el flujo no está claro, explica dónde se rompe la trazabilidad.

## Formato de respuesta
1. **Resumen del flujo API**
2. **Punto de entrada**
3. **Recorrido paso a paso**
4. **Contratos y datos que atraviesan el flujo**
5. **Errores, validaciones y códigos de respuesta**
6. **Archivos clave**
7. **Riesgos / zonas frágiles**
8. **Preguntas abiertas o vacíos de trazabilidad**

## Criterios
- No enumeres archivos sin explicar cómo colaboran.
- Explica claramente el salto entre capas.
- Si detectas duplicación, contratos implícitos o validación inconsistente, menciónalo.
- Si no se pasa argumento, pide al usuario el flujo API a rastrear.
