# iTech Platform

Plataforma **E-commerce + ERP** de iTech Import Perú sobre **Next.js + Supabase + Vercel**.
Monorepo gestionado con **Turborepo + pnpm**.

> Arquitectura completa: ver [`DOCUMENTO-MAESTRO.md`](./DOCUMENTO-MAESTRO.md).

## Estructura

```
apps/
  web/      → Storefront + portal cliente + portal B2B (itech.pe)
  admin/    → Back-office ERP (admin.itech.pe)
packages/
  ui/       → Design system (marca iTech: blanco + celestes) + preset Tailwind
  db/       → Clientes Supabase y tipos
  config/   → tsconfig base compartido
supabase/
  migrations/ → Esquema + RLS versionados
```

## Requisitos
- Node.js ≥ 20
- pnpm 9

## Puesta en marcha

```bash
pnpm install

# Variables de entorno (por app): copiar y completar
cp .env.example apps/web/.env.local
cp .env.example apps/admin/.env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

pnpm dev      # levanta web (3000) y admin (3001)
pnpm build    # build de producción de ambas apps
```

## Seguridad
- `NEXT_PUBLIC_SUPABASE_*` son públicas (seguras en el navegador).
- `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_ACCESS_TOKEN` son **secretos**: van solo en
  `.env.local` (ignorado por git) o en variables de entorno de Vercel. **Nunca** se commitean.
- La seguridad de datos vive en **Postgres RLS** (ver §5 del documento maestro).

## Estado
**Fase 0 + base de Fase 1**: monorepo, design system con marca, storefront moderno
con imágenes reales, y admin con autenticación Supabase. Los módulos del ERP se
habilitan por fases (ver roadmap §13 del documento maestro).
