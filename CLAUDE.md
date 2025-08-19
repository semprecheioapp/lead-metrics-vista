# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview
**SaaS CRM Platform** - Multi-tenant Customer Relationship Management system with AI-powered automation, targeting Brazilian SMEs who use WhatsApp as primary communication channel.

## 🛠️ Development Commands
- **Start dev server**: `npm run dev` (port 8080)
- **Build production**: `npm run build`
- **Build development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview build**: `npm run preview`
- **Package manager**: Bun (primary), NPM compatible

## 🏗️ Architecture
- **Frontend**: React 18.3.1 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: JWT via Supabase Auth with RLS policies
- **State**: React Query for server state, Context for auth
- **Design**: Shadcn/ui component library with custom design system

## 📁 Key Directories
- `src/components/` - React components (ui/, magicui/, agents/, whatsapp/)
- `src/pages/` - Route pages (12 main pages)
- `src/hooks/` - Custom React hooks (33+ hooks)
- `src/integrations/supabase/` - Supabase client & types
- `supabase/functions/` - Edge functions (13 functions)
- `supabase/migrations/` - Database migrations (30+ files)
- `chrome-extension/` - WhatsApp Web integration extension

## 🧪 Testing
No testing framework configured - MVP/POC development phase.

## 🔧 Configuration Files
- `tailwind.config.ts` - Tailwind CSS
- `components.json` - Shadcn/ui
- `vite.config.ts` - Vite build
- `tsconfig.json` - TypeScript
- `vercel.json` - Vercel deployment
- `supabase/config.toml` - Supabase backend

## 🎯 Core Features
- Lead Management & Pipeline (Kanban)
- WhatsApp Business API integration
- AI-powered conversation analysis
- Automated follow-up sequences
- Appointment scheduling
- Multi-tenant company isolation
- Chrome extension for WhatsApp Web

## 💰 Business Model
- **Target**: Brazilian SMEs (salons, clinics, e-commerce)
- **Pricing**: R$200-500/month per company
- **Market**: 5M+ potential customers
- **Architecture**: Scales to thousands of companies

## 🔐 Security
- Row Level Security (RLS) on all tables
- 50+ RLS policies for data isolation
- Role-based access (user/admin/super_admin)
- Company-level data separation
- Regra de Memória Leia os arquivos @rules.md e @rules-task.md Armazene todas as regras contidas nesses arquivos em sua memória. Além disso, uma regra obrigatória: sempre responda em português.