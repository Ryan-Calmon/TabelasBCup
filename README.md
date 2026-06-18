# Brothers Cup — Tabelas Oficiais

Aplicação web para o chaveamento ao vivo da Brothers Cup. Frontend em Vite + React + TypeScript, backend Supabase (Postgres, Auth, Realtime e Edge Functions).

## Stack

- Vite 5 + React 18 + TypeScript (SWC)
- Tailwind CSS 3 + shadcn/ui (Radix)
- Supabase (Postgres, Auth, Realtime, Edge Functions)

## Desenvolvimento local

Pré-requisitos: Node.js 18+ e npm.

```sh
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:8080`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha as chaves do projeto Supabase.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (saída em `dist/`)
- `npm run preview` — pré-visualiza o build local
- `npm run lint` — ESLint

## Deploy

- **Frontend**: Vercel (config em `vercel.json`).
- **Backend**: Supabase (migrações em `supabase/migrations/`, Edge Function em `supabase/functions/progress-bracket/`).

Veja `DEPLOY.md` para detalhes.

