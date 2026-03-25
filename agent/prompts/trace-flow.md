---
description: Sigue un flujo end-to-end a través del código y explica cómo funciona
---

## Flujo con subagente
Si el tool `subagent` está disponible, delega primero esta exploración al agente `scout`. Pídele que siga el flujo y te devuelva un handoff comprimido con el recorrido y los riesgos. Luego sintetiza tú el resultado final para el usuario. Solo si `subagent` no está disponible, haz el trabajo inline.

Traza el flujo `$@` dentro del proyecto actual.

## Objetivo
Entender cómo funciona realmente un flujo end-to-end en el sistema: entrada, navegación, estado, llamadas, transformaciones, efectos secundarios y salida.

## Instrucciones
1. Usa el argumento del comando como nombre del flujo a investigar.
2. Busca primero las piezas más probables usando herramientas rápidas (`rg`, `fd`, `bat`).
3. Sigue el flujo a través de las capas relevantes, por ejemplo:
   - rutas o pantallas
   - componentes
   - hooks
   - stores / state managers
   - servicios o clientes API
   - backend / endpoints si aplica
   - tracking, analytics o side effects si existen
4. Si el flujo no está claro, explica dónde se pierde la trazabilidad.

## Formato de respuesta
1. **Resumen del flujo**
2. **Punto de entrada**
3. **Recorrido paso a paso**
4. **Archivos clave**
5. **Estado y datos que atraviesan el flujo**
6. **Riesgos / zonas frágiles**
7. **Preguntas abiertas o vacíos de trazabilidad**

## Criterios
- No te quedes en una descripción superficial del árbol de archivos.
- Explica causa y efecto entre piezas.
- Si detectas acoplamiento raro, duplicación o fragilidad, menciónalo.
- Si no se pasa argumento, pide al usuario el flujo a rastrear.
