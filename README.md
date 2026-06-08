# TaskFlow — Modern Task Management System

**TaskFlow** es un sistema moderno de gestión de tareas que permite a los usuarios organizar su trabajo a través de proyectos y tareas. Construido con **Next.js 16**, **React Server Components (RSC)**, **Prisma 7**, **PostgreSQL**, y **shadcn/ui**.

---

## 🎯 Propósito del Proyecto

TaskFlow simplifica la colaboración en equipo al proporcionar:

- ✅ **Gestión de Proyectos** — Los administradores crean proyectos y agregan miembros
- ✅ **Seguimiento de Tareas** — Crear, asignar y completar tareas con estado (PENDIENTE → EN PROGRESO → COMPLETADO)
- ✅ **Control de Acceso Basado en Roles** — ADMIN para gestión global, USER para colaboración
- ✅ **Perfiles de Usuario** — Información del usuario, bio, avatar, rol
- ✅ **Dashboard Analítico** — Seguimiento de progreso de proyectos y tareas completadas
- ✅ **Gestión de Usuarios** — Panel administrativo para gestionar roles y estado de usuarios
- ✅ **Autenticación Segura** — Integración con Supabase Auth (email/contraseña)

---

## 🚀 Quick Start

### Requisitos Previos

- **Node.js** 18+
- **pnpm** (gestor de paquetes recomendado)
- **PostgreSQL** 14+ (Supabase recomendado)
- Variables de entorno configuradas (ver `.env.local.example`)

### Instalación

```bash
# 1. Clonar y acceder al proyecto
git clone <repo-url>
cd "Sistema de Gestión de Tareas"

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase y DB

# 4. Ejecutar migraciones de Prisma
pnpm prisma migrate deploy

# 5. Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
app/
├── (auth)/                    # Rutas públicas (Login, Signup)
│   ├── login/
│   ├── signup/
│   └── change-password/
├── (main)/                    # Rutas protegidas (requieren autenticación)
│   ├── dashboard/             # Dashboard principal (overview)
│   ├── projects/              # Gestión de proyectos
│   │   ├── page.tsx
│   │   ├── queries.ts         # Funciones de lectura de BD
│   │   ├── actions.ts         # Server Actions (crear, editar, eliminar)
│   │   └── _components/       # Componentes de proyectos
│   ├── tasks/                 # Gestión de tareas
│   │   ├── page.tsx
│   │   ├── queries.ts
│   │   ├── actions.ts
│   │   └── _components/
│   ├── users/                 # Gestión de usuarios (solo ADMIN)
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── _components/
│   ├── profile/               # Perfil del usuario
│   └── layout.tsx             # Layout con sidebar + top bar
├── api/                       # API REST
│   ├── users/                 # Listar usuarios (paginado)
│   ├── user/                  # CRUD de perfil individual
│   └── chat/                  # Chat AI endpoint
├── generated/                 # Cliente Prisma generado
│   └── prisma/
└── layout.tsx                 # Root layout

components/
├── app-sidebar.tsx            # Barra lateral con navegación
├── top-bar.tsx                # Barra superior
├── login-form.tsx             # Formulario de login
├── signup-form.tsx            # Formulario de registro
├── data-table.tsx             # Componente tabla reutilizable
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── sidebar.tsx
│   └── ... (otros componentes UI)
└── chat/                      # Componentes de chat

lib/
├── prisma.ts                  # Cliente Prisma singleton
├── utils.ts                   # Utilidades generales
├── auth/
│   └── guard.ts               # Funciones de autenticación y autorización
├── api/
│   ├── auth.ts                # Middleware de auth para API
│   └── validation.ts          # Validación de datos
├── supabase/
│   ├── client.ts              # Cliente Supabase (browser)
│   ├── server.ts              # Cliente Supabase (server)
│   └── admin.ts               # Cliente Supabase admin
└── ai/
    ├── provider.ts            # Configuración de provider AI
    └── tools/                 # Herramientas para AI

prisma/
├── schema.prisma              # Esquema de base de datos
└── migrations/                # Historial de migraciones

docs/                          # Documentación interna
├── project-overview.md
└── specs/
    ├── auth-spec.md
    ├── projects-spec.md
    ├── tasks-spec.md
    └── users-spec.md
```

---

## 📊 Modelo de Datos

### Entidades Principales

#### **Profile**
```typescript
{
  id: UUID              // Identificador único
  username: string      // Único por usuario
  fullName: string      // Nombre completo
  avatarUrl: string     // URL del avatar
  bio: string           // Biografía corta
  role: ADMIN | USER    // Rol del usuario
  enabled: boolean      // Cuenta activa
  deleted: boolean      // Soft delete (borrado lógico)
}
```

#### **Project**
```typescript
{
  id: UUID              // Identificador único
  name: string          // Nombre del proyecto
  createdBy: UUID       // ID del creador (FK → Profile)
  members: Profile[]    // Lista de miembros del proyecto
  tasks: Task[]         // Lista de tareas del proyecto
}
```

#### **ProjectMember**
```typescript
{
  id: UUID
  projectId: UUID       // Ref al proyecto
  profileId: UUID       // Ref al miembro
  // Relación única: cada miembro solo puede estar una vez en un proyecto
}
```

#### **Task**
```typescript
{
  id: UUID
  title: string
  description: string
  status: PENDING | IN_PROGRESS | COMPLETED
  projectId: UUID       // Proyecto al que pertenece
  assigneeId: UUID      // Usuario asignado (debe ser miembro del proyecto)
  createdById: UUID     // Quién creó la tarea
  completedById: UUID   // Quién completó (si aplica)
  completedAt: Date     // Cuándo se completó
}
```

### Relaciones de Acceso

```
┌─────────────┐
│  Profile    │  —owns→  ┌─────────┐  —members→  ┌────────────────┐
│             │          │Project  │             │ ProjectMember  │
└─────────────┘          └─────────┘             └────────────────┘
      ↓ (ADMIN)                 ↓ (contains)
   —assigned→
   —created→
   —completed→
      ↓
┌─────────────┐
│    Task     │
└─────────────┘
```

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

1. **Registro/Login** → Usuario entra credenciales en Supabase
2. **JWT Token** → Supabase genera JWT y lo almacena en el cliente
3. **Session Retrieval** → `getSession()` obtiene user de Supabase y lo sincroniza con Prisma
4. **Route Guard** → Funciones como `requireAuth()` y `requireRole()` protegen rutas
5. **DB Query Gate** → Queries verifican permisos a nivel de BD

### Roles y Permisos

| Rol | Dashboard | Proyectos | Tareas | Usuarios | Chat |
|-----|-----------|-----------|--------|----------|------|
| USER | ✅ | Ver asignados | Ver/asignar en su proyecto | ❌ | ✅ |
| ADMIN | ✅ | Crear/editar/eliminar todos | Crear/editar/completar | Crear/editar/eliminar | ✅ |

### Archivos Clave de Auth

- **[lib/auth/guard.ts](lib/auth/guard.ts)** — `requireAuth()`, `requireRole()`, `getSession()`
- **[lib/api/auth.ts](lib/api/auth.ts)** — Middleware para rutas API
- **[lib/supabase/server.ts](lib/supabase/server.ts)** — Cliente Supabase server-side

---

## 🛠️ Patrones Arquitectónicos

### 1. Server Actions + Cache Invalidation

```typescript
// app/(main)/projects/actions.ts
'use server'
export async function createProject(name: string) {
  const session = await requireRole('ADMIN')
  const project = await prisma.project.create({
    data: { name, createdBy: session.id }
  })
  revalidatePath('/projects')  // Actualiza UI automáticamente
  return project
}
```

### 2. Queries Separadas para Lógica de Datos

```typescript
// app/(main)/tasks/queries.ts
export async function getTasksByProject(projectId: string) {
  // Verifica permisos antes de retornar datos
  await requireAuth()
  return prisma.task.findMany({
    where: { projectId },
    include: { assignee: true, createdBy: true }
  })
}
```

### 3. Suspense Boundaries para Carga Async

```tsx
<Suspense fallback={<TasksSkeleton />}>
  <TasksList projectId={id} />  {/* RSC async component */}
</Suspense>
```

### 4. Gating de Membresía

```typescript
// Solo ver proyectos que owns (ADMIN) o es miembro (USER)
const projects = await prisma.project.findMany({
  where: isAdmin
    ? { createdBy: userId }
    : { members: { some: { profileId: userId } } },
})
```

### 5. UI basada en Roles

```tsx
// components/app-sidebar.tsx
const navItems = user?.role === 'ADMIN'
  ? [...baseNavItems, { title: 'Usuarios', url: '/users' }]
  : baseNavItems
```

---

## 📚 Tecnologías Utilizadas

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 16.2.2 (App Router, RSC) |
| **Lenguaje** | TypeScript |
| **Base de Datos** | PostgreSQL (Supabase) |
| **ORM** | Prisma 7 (con driver adapter PG) |
| **Autenticación** | Supabase Auth (JWT) |
| **UI Components** | shadcn/ui + Radix UI |
| **Iconos** | @hugeicons/react |
| **Estilos** | Tailwind CSS 4 (`@import` syntax) |
| **Tablas** | TanStack React Table |
| **Gráficas** | Recharts |
| **Validación** | Zod |
| **Notificaciones** | sonner (toasts) |
| **Arrastrar/Soltar** | dnd-kit |
| **Gestor de paquetes** | pnpm |

---

## 🔧 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor dev (http://localhost:3000)
pnpm build            # Build de producción
pnpm lint             # Ejecuta ESLint 9

# Prisma
pnpm prisma migrate dev           # Crea migración y aplica cambios
pnpm prisma migrate deploy        # Aplica migraciones en producción
pnpm prisma generate              # Regenera cliente Prisma
pnpm prisma studio                # Abre Prisma Studio (admin de BD)
```

---

## 📝 Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Base de Datos (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# AI Provider (OpenAI / Anthropic)
ANTHROPIC_API_KEY=your-key-here
```

---

## 🎨 Guía de Estilo de Código

### Convenciones

- **Componentes**: PascalCase (`UserCard.tsx`)
- **Funciones**: camelCase (`getUserProfile()`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Tipos**: PascalCase (`UserWithProfile`)
- **Carpetas privadas**: `_components/`, `_utils/` (no exportadas directamente)

### Comentarios en Código

- Todos los comentarios en **inglés**
- Explicar el **"por qué"**, no el "qué"
- Aclarar decisiones no obvias y lógica compleja
- Mantener comentarios cerca del código que describen

### Patrones de Importación

```typescript
// Orden de importes: estándar → librerías → proyecto
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { requireAuth } from '@/lib/auth/guard'
import type { Task } from '@/app/generated/prisma'
```

---

## 🚀 Deployment

### En Vercel (Recomendado)

```bash
# 1. Push a GitHub
git push origin main

# 2. Conecta repo en Vercel Dashboard
# 3. Configura variables de entorno en Settings
# 4. Deploy automático ✅
```

### En Otros Servidores

```bash
# 1. Build
pnpm build

# 2. Start
pnpm start

# O usa un container Docker...
```

---

## 📖 Documentación Interna

- [docs/project-overview.md](docs/project-overview.md) — Descripción técnica completa
- [docs/specs/auth-spec.md](docs/specs/auth-spec.md) — Especificación de autenticación
- [docs/specs/projects-spec.md](docs/specs/projects-spec.md) — Especificación de proyectos
- [docs/specs/tasks-spec.md](docs/specs/tasks-spec.md) — Especificación de tareas
- [docs/specs/users-spec.md](docs/specs/users-spec.md) — Especificación de usuarios

---

## 🐛 Solución de Problemas

### Error: "DATABASE_URL no definida"
Asegúrate de que `.env.local` contiene `DATABASE_URL` válida.

### Error: "Supabase client not initialized"
Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén en `.env.local`.

### Error: "Prisma client not found"
Ejecuta `pnpm prisma generate` para regenerar el cliente.

### Migraciones no aplican
```bash
pnpm prisma migrate resolve --rolled-back
pnpm prisma migrate deploy
```

---

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/nombre-feature`
2. Haz cambios y prueba localmente
3. Crea PR con descripción clara
4. Espera review
5. Merge a `main`

---

## 📄 Licencia

[Especificar licencia aquí]

---

**Última actualización:** 7 de junio de 2026
