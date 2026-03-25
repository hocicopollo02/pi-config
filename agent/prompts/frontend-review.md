---
description: Ejecuta react-doctor sobre el repo actual y evalúa sus hallazgos
---

## Flujo con subagente
Si el tool `subagent` está disponible, delega primero esta revisión al agente `reviewer`. Pídele que ejecute el diagnóstico, analice la salida y te devuelva un informe comprimido. Luego sintetiza tú el resultado final para el usuario. Solo si `subagent` no está disponible, haz el trabajo inline.

## Guía local opcional
Si existe `REVIEW_GUIDELINES.md` junto a `.pi` o en la raíz del repo, léelo y úsalo como guía adicional del proyecto.

Haz una revisión frontend del proyecto actual usando React Doctor.

## Paso 1: ejecutar diagnóstico
Ejecuta EXACTAMENTE este comando desde la raíz del proyecto:

```bash
npx -y react-doctor@latest . -y
```

## Paso 2: analizar resultados
Evalúa la salida del comando y produce un informe práctico.

### Qué analizar
- errores reales detectados
- warnings importantes
- problemas de arquitectura o configuración expuestos por la herramienta
- issues de performance, React patterns, bundling o DX si aparecen
- posibles falsos positivos o hallazgos dudosos

### Formato de respuesta
Responde con estas secciones:
1. **Resumen ejecutivo**
2. **Hallazgos clave**
3. **Severidad** (`alta`, `media`, `baja`)
4. **Qué arreglar primero**
5. **Posibles falsos positivos / validaciones manuales**
6. **Siguiente paso recomendado**

## Criterios
- No te limites a repetir la salida del comando: interprétala.
- Separa claramente síntomas de causas.
- Si algo no queda claro, dilo explícitamente.
- Prioriza impacto real en mantenibilidad, bugs y rendimiento.
- No modifiques código todavía, salvo que el usuario lo pida después.
