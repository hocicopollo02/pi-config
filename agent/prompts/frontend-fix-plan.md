---
description: Convierte hallazgos frontend en un plan de remediación priorizado
---

## Flujo con subagente
Si el tool `subagent` está disponible, delega primero esta planificación al agente `planner`. Pásale los hallazgos disponibles y pídele un plan priorizado. Luego sintetiza tú el resultado final para el usuario. Solo si `subagent` no está disponible, planifica inline.

Genera un plan de remediación frontend para el proyecto actual.

## Objetivo
Tomar hallazgos existentes del análisis del proyecto —por ejemplo de `/frontend-review`, de logs, de typecheck, de lint o de inspección manual— y convertirlos en un plan ejecutable.

## Qué hacer
1. Si ya hay hallazgos en el contexto, reutilízalos.
2. Si no los hay, inspecciona el proyecto lo suficiente para identificar problemas frontend relevantes antes de planificar.
3. Agrupa los problemas por tipo:
   - bugs
   - arquitectura
   - performance
   - accesibilidad
   - DX / mantenibilidad
4. Ordena el trabajo por impacto y riesgo.

## Formato de respuesta
1. **Resumen ejecutivo**
2. **Problemas priorizados**
3. **Plan por fases**
   - fase 1: quick wins seguros
   - fase 2: mejoras de impacto medio
   - fase 3: refactors estructurales
4. **Riesgos y dependencias**
5. **Qué medir o validar después de cada fase**
6. **Primer cambio recomendado**

## Criterios
- Diferencia claramente arreglos locales de cambios sistémicos.
- Evita planes vagos tipo “mejorar performance” sin acciones concretas.
- Indica si conviene atacar primero causas raíz en vez de síntomas.
- No implementes todavía; solo planifica con criterio.
