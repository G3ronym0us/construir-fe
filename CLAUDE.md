# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
E-commerce store for a hardware store (ferretería). Next.js 15.5.4 application using React 19, TypeScript, and Tailwind CSS v4. Uses Turbopack for faster builds.

## Key Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture
- **Framework**: Next.js with App Router (app directory structure)
- **Styling**: Tailwind CSS v4 with PostCSS integration
- **TypeScript**: Strict mode enabled, path alias `@/*` maps to `./src/*`
- **Fonts**: Uses Geist Sans and Geist Mono from next/font/google

### Project Structure
```
src/
├── app/              # Next.js app router pages
│   ├── layout.tsx    # Root layout with fonts
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── lib/              # Core utilities
│   └── api.ts        # HTTP client with auth support
├── services/         # API service layer
│   ├── auth.ts       # Authentication (register, login, profile)
│   └── products.ts   # Products CRUD operations
└── types/            # TypeScript definitions
    └── index.ts      # User, Product, DTOs, ApiError
```

## Backend Integration
- **API URL**: Set via `NEXT_PUBLIC_API_URL` in `.env.local` (default: http://localhost:3000)
- **Auth Flow**: JWT tokens stored client-side, passed via Bearer token in Authorization header
- **API Client**: Centralized HTTP client in `src/lib/api.ts` handles all requests with automatic token injection

## ESLint Configuration
Uses Next.js core-web-vitals and TypeScript presets via FlatCompat. Ignores: node_modules, .next, out, build, next-env.d.ts.

## Deployment Notes
- Push changes to supreme remote repository
- Designed for Vercel deployment
