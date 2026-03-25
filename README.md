# 🏗️ Personal AI Agent Configuration

Sistema personalizado de configuración para un agente AI avanzado, diseñado como **Senior Architect Mentor**. Este repositorio define la personalidad, comportamiento, herramientas y guardrails de un asistente técnico de alto nivel.

---

## 📋 Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Componentes Principales](#componentes-principales)
3. [Cómo Funciona](#cómo-funciona)
4. [Configuración](#configuración)
5. [Agentes Especializados](#agentes-especializados)
6. [Sistema de Memoria (Engram)](#sistema-de-memoria-engram)
7. [Seguridad y Guardrails](#seguridad-y-guardrails)

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

### 1. **SYSTEM.md** — El Alma del Agente
Define la **personalidad y filosofía** del asistente:

**Rol:** Senior Architect (15+ años experiencia) con mentalidad de MENTOR

**Principios Clave:**
- ✅ Ayuda primero, explica después
- ✅ Respuestas simples para preguntas simples
- ✅ Ejecución sin burocracia
- ✅ Tono cálido y directo (sin condescendencia)
- ✅ Conceptos > código (enseña los "por qué")

**Filosofía Técnica:**
- IA es herramienta, los humanos deciden la arquitectura
- Fundamentación antes de código
- Propuestas con contexto: "qué", "por qué", "alternativas"

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

**Paquetes Instalados:**
- `pi-mcp-adapter` — Adaptador para Model Context Protocol
- `@calesennett/pi-codex-usage` — Tracking de uso del Codex
- `pi-web-access` — Acceso a web
- `pi-subagents` — Sistema de sub-agentes
- `pi-autoresearch` — Loop autónomo de investigación
- `pi-bash-live-view` — Visualización de comandos bash

---

### 3. **models.json** — Modelos Disponibles
Define qué modelos de IA están disponibles y sus capacidades (pricing, límites de tokens, velocidad).

### 4. **mcp.json** — Model Context Protocol
Configura servidores MCP externos que amplían las capacidades del agente (ej: MCP para navegador, filesystem, etc).

---

## ⚙️ Cómo Funciona

### Flujo de Ejecución

```
┌─────────────────────────────────────┐
│   Usuario hace una solicitud        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  SYSTEM.md determina persona        │
│  y marco de decisiones              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Selecciona agente apropiado        │
│  (scout/planner/reviewer o principal)
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Carga prompts especializados       │
│  del directorio /prompts            │
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
│  Guarda en memoria persistente      │
│  (Engram) si es relevante          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Respuesta al usuario              │
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

## 👥 Agentes Especializados

El sistema delega trabajo a **sub-agentes** para tareas intensivas en contexto:

### 1. **Scout** 🔍
**Propósito:** Exploración técnica y reconocimiento

**Casos de uso:**
- Mapear codebase grande
- Seguir flujos de datos
- Entender impacto de cambios
- Análisis de dependencias

**Entrada esperada:** Preguntas sobre "cómo funciona esto", "qué archivos toca", "dónde está X"

---

### 2. **Planner** 📋
**Propósito:** Conversión de hallazgos en planes concretos

**Casos de uso:**
- Refactorización compleja
- Arquitectura de nuevas features
- Planificación de optimizaciones
- Diseño de soluciones

**Entrada esperada:** "Crea un plan para...", "Cómo estructuraría..."

---

### 3. **Reviewer** ✅
**Propósito:** Auditoría, verificación y quality gates

**Casos de uso:**
- Code review automático
- Pre-merge checks
- Auditoría de seguridad
- Verificación de convenciones

**Entrada esperada:** "Revisa esto", "Verifica calidad", "Pre-ship check"

---

## 💾 Sistema de Memoria (Engram)

El agente mantiene **memoria persistente** de decisiones, patterns y aprendizajes.

### Cuándo Guarda Automáticamente

```yaml
Tipos de información guardada:
  - ✅ Bugfixes resueltos
  - ✅ Decisiones arquitectónicas
  - ✅ Hallazgos no obvios del código
  - ✅ Cambios de configuración
  - ✅ Patrones establecidos
  - ✅ Preferencias del usuario
```

### Formato de Memorias

```markdown
Title:      [verbo + tema corto]
Type:       [bugfix | decision | architecture | discovery | pattern]
Topic Key:  [ej: architecture/auth-model]
Scope:      [project | personal]
Content:    
  - What:    Qué fue
  - Why:     Por qué importa
  - Where:   Dónde afecta
  - Learned: Qué aprendimos
```

### Búsqueda de Memoria

Automáticamente busca contexto previo al iniciar:
1. `mem_context` — Contexto general del proyecto
2. `mem_search` — Búsqueda específica por tema
3. `mem_get_observation` — Recupera hallazgo específico

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
Prohibido (sin confirmación):
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
¿Tiene ask: true?
          ├─ Sí → Pide confirmación al usuario
          └─ No → Bloqueado silenciosamente
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

## 📊 Filosofía de Trabajo

### Análisis de Complejidad
```
Pregunta simple (1 archivo)
    → Respuesta directa (sin subagentes)

Pregunta mediana (pocos archivos)
    → Exploración + respuesta

Pregunta compleja (codebase grande)
    → Scout explora → Planner diseña → Reviewer verifica
```

### Calidad de Respuesta
```
Conceptos > Código              # Explica primero el "qué"
Contexto > Detalles             # Visión general antes de micro
Alternativas > Mandato          # Opciones con pros/contras
Fundamentación > Rapidez        # Mejor tomar 5 min extra
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Exploración de Código

```
Usuario: "¿Cómo fluye la autenticación en este proyecto?"

Proceso:
1. SYSTEM.md → Persona: "Enseño conceptos"
2. Delega a Scout → Mapea flujo de auth
3. Scout reporta hallazgos
4. Respuesta: "Aquí están los 5 pasos principales... porque..."
```

### Ejemplo 2: Refactorización

```
Usuario: "Refactoriza este componente"

Proceso:
1. Planner explora estado actual
2. Propone 3 alternativas arquitectónicas
3. Explica trade-offs de cada una
4. Usuario elige
5. Reviewer verifica calidad post-cambio
```

### Ejemplo 3: Guardado de Conocimiento

```
Descubre patrón nuevo
    ↓
mem_save type:pattern
topic_key: patterns/error-handling-strategy
    ↓
Próxima vez que trabajo con error handling
    ↓
mem_search → Recupera patrón + razón + dónde se usa
```

---

## 🔄 Ciclo de Sesión

### Al Iniciar
1. Carga `SYSTEM.md` → Define persona
2. `mem_context` → Recupera contexto previo
3. Listo para trabajar

### Durante el Trabajo
1. Elige herramienta/agente apropiado
2. Ejecuta dentro de guardrails
3. Guarda descubrimientos en Engram
4. Responde con conceptos + código

### Al Cerrar
1. Resumen de sesión (`mem_session_summary`)
2. Secciones: Goal, Instructions, Discoveries, Accomplished, Next Steps
3. Memoria persistente para próxima sesión

---

## 🎓 Principio Central

> **Sé cálido, práctico y directo.**  
> Ayuda primero. Explica después.  
> Preguntas simples = respuesta simple.  
> Ejecución sin burocracia cuando la solicitud es clara.

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

Este repositorio configura un **sistema inteligente de agente AI** que:

✅ **Piensa como arquitecto senior** → Conceptos fundamentados  
✅ **Enseña, no ordena** → Cálido y mentoreable  
✅ **Delega inteligentemente** → Sub-agentes para complejidad  
✅ **Recuerda todo** → Sistema Engram de memoria persistente  
✅ **Previene daños** → Damage control rules  
✅ **Se adapta** → Múltiples prompts y modelos  

**Resultado:** Un asistente confiable, inteligente y seguro para trabajo técnico profundo. 🚀
