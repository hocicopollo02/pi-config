---
description: Carga contexto base del repositorio actual antes de empezar a trabajar
---

Haz un prime del repositorio actual antes de proponer cambios.

## Objetivo
Entender rápido y con criterio:
- propósito del proyecto
- stack y runtime
- estructura del repo
- puntos de entrada
- convenciones relevantes
- archivos/configuración que probablemente condicionen el trabajo

## Flujo recomendado
1. Inspecciona la forma del repo con herramientas modernas (`fd`, `rg`, `bat`) y evita lecturas masivas sin necesidad.
2. Lee primero, si existen:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `README*`
   - `package.json`
   - `pyproject.toml`
   - `Cargo.toml`
   - `go.mod`
   - `justfile`, `Makefile`, `Taskfile.yml`
   - `.pi/settings.json`
   - configuraciones de workspace/tooling relevantes
3. Detecta:
   - framework principal
   - sistema de build/test/lint
   - cómo se ejecuta localmente
   - carpetas importantes
   - posibles zonas delicadas o de alto impacto
4. Resume al final en formato práctico:
   - Qué es este proyecto
   - Stack
   - Estructura
   - Entry points clave
   - Config relevante
   - Riesgos / cosas a tener en cuenta
   - Siguiente mejor paso recomendado

## Estilo
- Sé concreto y orientado a ejecución.
- No inventes; si algo no está claro, dilo.
- Prioriza conceptos y mapa del sistema sobre detalles irrelevantes.
- Si el usuario ya dijo una tarea concreta, conecta el prime con esa tarea.
