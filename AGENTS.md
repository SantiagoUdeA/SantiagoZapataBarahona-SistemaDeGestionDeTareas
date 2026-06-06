# Caveman mode ultra

ALWAYS READ THIS SKILL BEFORE CONTINUING `.agents/skills/caveman/SKILL.md`
You have to use caveman in ultra mode

# Design

- If you are crafting or modifying UI you MUST read @DESIGN.md
- ALWAYS adpat the UI to shadcn components `components/ui`


<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Commands

- `pnpm dev` — dev server at `http://localhost:3000`
- `pnpm build` — production build
- `pnpm lint` — ESLint 9 flat config
- No test, typecheck, or format scripts exist

# Stack quirks

- **Next.js 16.2.2** — check `node_modules/next/dist/docs/` before writing code; many legacy patterns broken
- **pnpm** is the package manager (ignore `.yarnrc.yml`, it's unused legacy)
- **Prisma 7** with the driver adapter pattern (`@prisma/adapter-pg`). Client generated to `app/generated/prisma`, not the default `node_modules/.prisma/client`. Import from `@/lib/prisma`.
- **Tailwind CSS 4** — `@import "tailwindcss"` syntax, NOT the old `@tailwind` directives
- **shadcn/ui** with `radix-mira` style — icon library is `@hugeicons/react`, NOT lucide-react
- **No auth middleware** yet — login form exists at `app/(auth)/login/` but no session/protection wired

# Architecture

- Route groups: `(auth)/login` (public), `(main)` (sidebar layout, `route.ts` files)
- `app/api/user/route.ts` — single user CRUD
- `app/api/users/route.ts` — list users
- Sidebar layout in `app/(main)/layout.tsx` with shadcn sidebar
- Prisma schema in `prisma/schema.prisma` — PostgreSQL, models: User, Perfil, Customer, Supplier, Product, Order, OrderItem, Payment

