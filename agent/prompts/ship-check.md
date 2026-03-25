---
description: Haz una última pasada de calidad antes de merge o deploy
---

## Flujo con subagente
Si el tool `subagent` está disponible, delega primero esta revisión al agente `reviewer`. Pídele una pre-flight check comprimida y orientada a riesgos. Luego sintetiza tú el resultado final para el usuario. Solo si `subagent` no está disponible, haz el trabajo inline.

## Guía local opcional
Si existe `REVIEW_GUIDELINES.md` junto a `.pi` o en la raíz del repo, léelo y úsalo como guía adicional del proyecto.

Haz una revisión final de preparación para merge o deploy.

## Objetivo
Detectar problemas obvios o costosos de última milla antes de dar algo por listo.

## Qué revisar
- errores funcionales evidentes
- estados vacíos, loading y error sin cubrir
- logs, TODOs, flags temporales o código de debugging olvidado
- copy confusa o mensajes poco claros
- problemas de accesibilidad visibles
- validaciones faltantes
- riesgo de romper flujos existentes
- deuda técnica introducida que merezca al menos quedar anotada
- consistencia entre implementación, tests y configuración

## Inspección sugerida
Usa lo que tenga sentido según el repo:
- `git diff --stat`
- `git diff`
- manifests y config relevante
- tests/lint/typecheck/build si aportan señal clara

## Formato de respuesta
1. **Estado de salida** (`listo`, `casi listo`, `no listo`)
2. **Bloqueantes**
3. **Riesgos no bloqueantes**
4. **Checklist de última milla**
5. **Recomendación final**

## Criterios
- Sé pragmático: esto es una pre-flight check, no una auditoría infinita.
- Prioriza lo que realmente puede romper producción o degradar UX.
- Si está razonablemente bien para salir, dilo sin dramatizar.
