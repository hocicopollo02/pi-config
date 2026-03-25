---
description: Revisa los cambios staged antes de commit y prioriza riesgos reales
---

## Flujo con subagente
Si el tool `subagent` está disponible, delega primero esta revisión al agente `reviewer` y pídele que examine el diff staged y te devuelva hallazgos priorizados. Luego sintetiza tú el resultado final para el usuario. Solo si `subagent` no está disponible, haz el trabajo inline.

## Guía local opcional
Si existe `REVIEW_GUIDELINES.md` junto a `.pi` o en la raíz del repo, léelo y úsalo como guía adicional del proyecto.

Haz una revisión de los cambios staged en git.

## Paso 1: inspección
Ejecuta estos comandos:

```bash
git diff --cached --stat
git diff --cached
```

## Paso 2: evaluación
Analiza los cambios con criterio de ingeniería senior.

### Qué revisar
- bugs potenciales
- regresiones funcionales
- edge cases no cubiertos
- errores de concurrencia, estado o asincronía
- contratos rotos entre capas
- deuda técnica introducida
- tests faltantes o tests que quedaron desalineados
- naming, legibilidad y complejidad innecesaria
- riesgos de seguridad si aparecen

### Formato de respuesta
1. **Resumen ejecutivo**
2. **Hallazgos**
3. **Severidad por hallazgo** (`alta`, `media`, `baja`)
4. **Qué arreglar antes de commit**
5. **Qué puede esperar**
6. **Tests o validaciones recomendadas**

## Criterios
- No hagas una revisión cosmética si no aporta valor.
- Prioriza problemas reales sobre preferencias personales.
- Si los cambios están bien, dilo claramente.
- No modifiques código todavía, salvo que el usuario lo pida.
