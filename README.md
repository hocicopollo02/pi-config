# 🏗️ Pi Configuration Repository

Configuración personalizada de **Pi**, un framework de IA que permite crear agentes inteligentes con comportamientos específicos. Este repositorio define cómo Pi se comporta: qué herramientas usa, cómo toma decisiones, qué reglas de seguridad sigue, y cómo recuerda información.

---

## 📋 Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Componentes Principales](#componentes-principales)
3. [Cómo Funciona](#cómo-funciona)
4. [Configuración](#configuración)
5. [Extensiones requeridas para este setup](#extensiones-requeridas-para-este-setup)
6. [Agentes Especializados](#agentes-especializados)
7. [Sistema de Memoria (Engram)](#sistema-de-memoria-engram)
8. [Seguridad y Guardrails](#seguridad-y-guardrails)

---

## 📁 Estructura del Proyecto

```
.pi/
├── agent/                          # Núcleo del agente
│   ├── SYSTEM.md                  # Sistema de prompts principal
│   ├── settings.json              # Configuración global
│   ├── models.json                # Modelos disponibles
│   ├── mcp.json                   # Configuración MCP (Model Context Protocol)
│   ├── keybindings.json           # Atajos de teclado
│   ├── agents/                    # Agentes especializados
│   │   ├── scout.md               # Explorador de código
│   │   ├── planner.md             # Planificador
│   │   └── reviewer.md            # Revisor de calidad
│   ├── prompts/                   # Prompts reutilizables
│   │   ├── prime.md               # Prompt principal
│   │   ├── frontend-review.md     # Review frontend
│   │   ├── api-review.md          # Review API
│   │   ├── trace-flow.md          # Análisis de flujo
│   │   └── [otros...]
│   └── git/                       # Repositorios clonados
├── damage-control-rules.yaml      # Reglas de seguridad
└── prompts/                       # Prompts generales

```

---

## 🎯 Componentes Principales

### 1. **SYSTEM.md** — El Alma de Pi
Define el **comportamiento y principios** del framework:

**Propósito:** Establecer cómo Pi interpreta solicitudes y genera respuestas

**Principios Clave:**
- ✅ Ejecución clara sin burocracia
- ✅ Respuestas proporcionales a la complejidad de la pregunta
- ✅ Explicación de conceptos fundamentales
- ✅ Tono directo y accesible
- ✅ Priorizar razonamiento sobre velocidad

**Enfoque Técnico:**
- Las herramientas (IA) son medios, no fines
- La arquitectura se decide basada en fundamentos sólidos
- Las propuestas incluyen contexto: "qué", "por qué", "alternativas"

---

### 2. **settings.json** — Configuración Global

```json
{
  "defaultModel": "claude-haiku-4.5",        // Modelo por defecto
  "defaultProvider": "github-copilot",       // Proveedor
  "defaultThinkingLevel": "high",            // Nivel de razonamiento
  "theme": "dark",                           // Tema UI
  "quietStartup": true,                      // Inicio silencioso
  "hideThinkingBlock": true                  // Ocultar pensamiento interno
}
```

**Extensiones activas en este setup (las que necesitás para usarlo igual):**
- `npm:pi-mcp-adapter` — Adaptador MCP
- `npm:@calesennett/pi-codex-usage` — Métricas de uso de herramientas/modelos
- `npm:pi-web-access` — Búsqueda web y extracción de contenido
- `npm:pi-subagents` — Delegación en subagentes (`subagent`)
- `https://github.com/davebcn87/pi-autoresearch` — Experimentos automáticos (`init_experiment`, `run_experiment`, `log_experiment`)
- `npm:pi-executor` — Integración Executor (`execute`) para usar APIs/tooling remoto
- `npm:pi-bash-live-view` — Ejecución bash con render en vivo
- `npm:pi-interview` — Formularios interactivos de preguntas/decisiones
- `npm:pi-design-deck` — Comparativas visuales lado a lado (`design_deck`)

---

### 3. **models.json** — Modelos Disponibles
Define qué modelos de IA están disponibles y sus capacidades (pricing, límites de tokens, velocidad).

### 4. **mcp.json** — Model Context Protocol
Configura servidores MCP externos que amplían las capacidades del agente (ej: MCP para navegador, filesystem, etc).

---

## ⚙️ Cómo Funciona Pi

### Flujo de Ejecución

```
┌─────────────────────────────────────┐
│   Usuario hace una solicitud        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  SYSTEM.md define el comportamiento │
│  y reglas de decisión               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Selecciona agente apropiado        │
│  (scout/planner/reviewer o Pi base) │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Carga prompts especializados       │
│  según el tipo de tarea             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Ejecuta con guardrails de seguridad│
│  (damage-control-rules.yaml)        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Guarda aprendizajes en memoria     │
│  (Engram) si es relevante          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Devuelve resultado al usuario     │
└─────────────────────────────────────┘
```

---

## 🔧 Configuración

### Cambiar el Modelo Predeterminado

Edit `settings.json`:
```json
"defaultModel": "claude-opus-4.1"  // Más potente pero más lento/caro
```

### Agregar Skills (Habilidades)

```json
"skills": [
  "-../../.agents/skills/vercel-react-best-practices/SKILL.md",
  "-/path/to/new/skill.md"
]
```

### Configurar Paquetes Adicionales

```json
"packages": [
  "npm:nuevo-paquete",
  "https://github.com/user/repo"
]
```

---

## 🧩 Extensiones requeridas para este setup

Si querés usar el agente **tal cual está configurado acá**, estas son las extensiones y para qué sirve cada una:

- `npm:pi-mcp-adapter` → conecta Pi con servidores MCP definidos en configuración.
- `npm:@calesennett/pi-codex-usage` → registra métricas de uso (herramientas/modelos) para seguimiento.
- `npm:pi-web-access` → habilita búsqueda web, extracción de contenido y research asistido.
- `npm:pi-subagents` → permite delegar trabajo en subagentes (`scout`, `planner`, `reviewer`, etc.).
- `https://github.com/davebcn87/pi-autoresearch` → agrega loop de experimentación automática con métricas.
- `npm:pi-executor` → habilita `execute` para usar APIs externas en sandbox con herramientas configuradas.
- `npm:pi-bash-live-view` → mejora la ejecución de bash con salida interactiva en vivo.
- `npm:pi-interview` → agrega formularios guiados para recoger decisiones/requisitos estructurados.
- `npm:pi-design-deck` → crea comparativas visuales lado a lado para decisiones de UI/arquitectura/código.

### Instalación rápida

```bash
pi install npm:pi-mcp-adapter
pi install npm:@calesennett/pi-codex-usage
pi install npm:pi-web-access
pi install npm:pi-subagents
pi install https://github.com/davebcn87/pi-autoresearch
pi install npm:pi-executor
pi install npm:pi-bash-live-view
pi install npm:pi-interview
pi install npm:pi-design-deck
```

También podés dejar esta lista en `agent/settings.json` dentro de `packages` para mantener el setup versionado.

> Nota: además de extensiones, este setup usa MCPs definidos en `agent/mcp.json` (`chrome-devtools` y `engram`). En particular, para memoria persistente necesitás tener disponible el comando `engram` en tu sistema.

---

## 👥 Agentes Especializados

Pi puede delegarse a **sub-agentes** para tareas complejas o que requieren exploración profunda:

### 1. **Scout** 🔍
**Propósito:** Exploración y mapeado de codebases

**Casos de uso:**
- Mapear proyectos grandes
- Seguir flujos de datos
- Entender impacto de cambios
- Análisis de dependencias

**Entrada esperada:** "Explora esto", "Qué archivos tocan", "Dónde está X"

---

### 2. **Planner** 📋
**Propósito:** Conversión de análisis en planes de acción

**Casos de uso:**
- Planificar refactorizaciones
- Diseñar nuevas features
- Optimizaciones complejas
- Arquitectura de soluciones

**Entrada esperada:** "Planifica cómo...", "Diseña una solución para..."

---

### 3. **Reviewer** ✅
**Propósito:** Auditoría y verificación de calidad

**Casos de uso:**
- Análisis de código
- Verificación pre-deploy
- Auditoría de seguridad
- Validación de convenciones

**Entrada esperada:** "Revisa esto", "Verifica calidad", "Pre-check"

---

## 💾 Sistema de Memoria (Engram)

Pi puede mantener **memoria persistente** de decisiones, patrones y aprendizajes a través de sesiones.

### Qué Se Guarda Automáticamente

```yaml
Tipos de información guardada:
  - ✅ Soluciones a problemas
  - ✅ Decisiones de diseño
  - ✅ Hallazgos técnicos
  - ✅ Cambios de configuración
  - ✅ Patrones encontrados
  - ✅ Preferencias aprendidas
```

### Formato de Registro

```markdown
Title:      [acción + tema]
Type:       [bugfix | decision | architecture | discovery | pattern]
Topic Key:  [ej: patterns/auth-flow]
Scope:      [project | personal]
Content:    
  - What:    Qué ocurrió
  - Why:     Por qué es importante
  - Where:   Dónde aplica
  - Learned: Lecciones clave
```

### Recuperación de Memoria

Pi busca contexto automáticamente:
1. `mem_context` — Contexto general del proyecto
2. `mem_search` — Búsqueda por tema específico
3. `mem_get_observation` — Recupera un hallazgo concreto

---

## 🛡️ Seguridad y Guardrails

### damage-control-rules.yaml

Sistema de **prevención de accidentes** con patrones peligrosos:

#### Reglas de Sistema
```yaml
Prohibido:
  ❌ rm, rmdir               # Eliminación de archivos
  ❌ chmod 777               # Permisos inseguros
  ❌ chown -R root           # Cambio recursivo de propietario
```

#### Reglas de Git
```yaml
Requiere confirmación:
  ⚠️  git reset --hard       # Descarta cambios locales
  ⚠️  git push --force       # Use --force-with-lease
  ⚠️  git stash clear        # Borra TODOS los stashes
  ⚠️  git filter-branch      # Reescribe historia completa
  ⚠️  git push --delete      # Borra rama remota
```

#### Flujo de Confirmación
```
Comando peligroso detectado
          ↓
¿Hay UI interactiva?
          ├─ Sí → Pide confirmación al usuario
          └─ No → Bloqueado (no hay forma de pedir permiso)
```

---

## 🚀 Herramientas Modernas Preferidas

El agente prioriza herramientas modernas y eficientes:

```bash
bat        # en lugar de cat       (sintaxis + líneas)
rg         # en lugar de grep      (MUCHO más rápido)
fd         # en lugar de find      (sintaxis intuitiva)
```

---

## 📊 Lógica de Trabajo

### Estrategia de Delegación
```
Pregunta simple (1-2 archivos)
    → Pi responde directamente

Pregunta mediana (pocos archivos)
    → Exploración + análisis

Pregunta compleja (codebase grande)
    → Scout explora → Planner diseña → Reviewer verifica
```

### Principios de Respuesta
```
Conceptos primero             # "Qué" y "por qué" antes de código
Contexto completo             # Visión general antes de detalles
Alternativas múltiples        # Opciones con trade-offs
Fundamentación sólida         # Mejor análisis que velocidad
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Análisis de Flujo

```
Usuario: "¿Cómo funciona el flujo de autenticación?"

Proceso:
1. SYSTEM.md → Define comportamiento esperado
2. Scout mapea el flujo entre archivos
3. Scout reporta hallazgos
4. Pi sintetiza: "5 pasos principales... porque..."
```

### Ejemplo 2: Planificación de Cambios

```
Usuario: "Planifica una refactorización de componentes"

Proceso:
1. Scout explora estado actual
2. Planner propone 3 alternativas con trade-offs
3. Usuario elige
4. Reviewer valida calidad post-cambio
```

### Ejemplo 3: Memoria Persistente

```
Se descubre un patrón importante
    ↓
mem_save type:pattern
topic_key: patterns/error-handling
    ↓
En futuras sesiones
    ↓
mem_search recupera patrón + contexto + dónde aplicar
```

---

## 🔄 Ciclo de Sesión

### Inicio de Sesión
1. Carga `SYSTEM.md` → Define comportamiento
2. `mem_context` → Recupera contexto previo (si existe)
3. Listo para procesar solicitudes

### Durante la Sesión
1. Selecciona herramienta/agente apropiado
2. Ejecuta dentro de guardrails (damage-control-rules)
3. Registra descubrimientos en Engram si aplica
4. Genera respuesta con análisis y contexto

### Cierre de Sesión
1. Resumen automático (`mem_session_summary`)
2. Secciones: Goal, Discoveries, Accomplished, Next Steps
3. Información se persiste para futuras sesiones

---

## 🎯 Principios Clave

> **Ejecución clara y fundamentada.**  
> Análisis antes que velocidad.  
> Respuestas proporcionales a la complejidad.  
> Alternativas siempre que sea relevante.

---

## 📚 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `agent/SYSTEM.md` | Filosofía y personalidad |
| `agent/settings.json` | Configuración global |
| `agent/agents/*.md` | Definición de sub-agentes |
| `agent/prompts/*.md` | Prompts especializados |
| `damage-control-rules.yaml` | Guardrails de seguridad |
| `agent/models.json` | Modelos disponibles |
| `agent/mcp.json` | Servidores MCP externos |

---

## ✨ Resumen

Este repositorio configura un **framework de IA inteligente** que:

✅ **Responde de forma estructurada** → Análisis fundamentado  
✅ **Delega tareas complejas** → Sub-agentes para exploración  
✅ **Recuerda contexto** → Sistema Engram de memoria persistente  
✅ **Previene accidentes** → Damage control rules de seguridad  
✅ **Se personaliza** → Múltiples prompts y modelos disponibles  
✅ **Sigue guardrails** → Decisiones dentro de límites claros  

**Resultado:** Un sistema de IA seguro, confiable y extensible. 🚀
