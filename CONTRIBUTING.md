# Contributing to Event Overview

Thank you for your interest in contributing to Event Overview! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/event-overview.git
   cd event-overview
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/event-overview.git
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Supabase account (for database features)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_POSTER_BUCKET=event-posters
NEXT_PUBLIC_SUBMIT_PASSWORD_HASH=your_sha256_hash
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Code Style

### General Guidelines

- Use **TypeScript** for all new code
- Follow existing code patterns and naming conventions
- Keep components small and focused
- Use meaningful variable and function names

### Formatting

- Use 2 spaces for indentation
- Use double quotes for strings (configured in ESLint)
- Always add trailing commas in multi-line arrays/objects

### File Organization

```
app/
├── [locale]/           # Locale-specific pages
│   ├── page.tsx        # Home page
│   ├── layout.tsx      # Locale layout
│   ├── events/[id]/    # Event detail page
│   └── submit/         # Submit form
│       ├── page.tsx
│       ├── useEventForm.ts
│       └── components/ # Page-specific components

components/             # Shared UI components
lib/                    # Utilities and business logic
types/                  # TypeScript type definitions
messages/               # i18n translation files
```

### Component Guidelines

- Use `"use client"` directive for components with hooks or browser APIs
- Use `React.memo()` for components that receive stable props
- Extract reusable logic into custom hooks

### Internationalization

All user-facing text must be internationalized:

```tsx
// ✅ Good
const t = useTranslations("common");
<p>{t("welcomeMessage")}</p>

// ❌ Bad
<p>Welcome to Event Overview</p>
```

Add translations to all three locale files:
- `messages/en.json`
- `messages/zh.json`
- `messages/ja.json`

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(submit): add poster upload component
fix(events): resolve date formatting issue
docs: update README with setup instructions
refactor(lib): extract event utilities
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks**:
   ```bash
   npm run lint
   npm run build
   npm run test
   ```

3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### PR Requirements

- [ ] All tests pass
- [ ] No lint errors
- [ ] Build completes successfully
- [ ] Translations added for all supported locales (if applicable)
- [ ] TypeScript types are properly defined
- [ ] PR description explains the changes

### Review Process

1. Submit your PR against the `main` branch
2. Wait for CI checks to pass
3. Address any review feedback
4. Once approved, your PR will be merged

## Project Structure

```
event-overview/
├── app/                    # Next.js App Router pages
├── components/             # Shared React components
├── lib/                    # Utilities, hooks, and business logic
│   ├── store.tsx           # Event store (React Context)
│   ├── eventRepository.ts  # Supabase CRUD operations
│   ├── event-utils.ts      # Date formatting, status computation
│   └── __tests__/          # Unit tests
├── types/                  # TypeScript type definitions
├── messages/               # i18n JSON files
├── i18n/                   # next-intl configuration
└── public/                 # Static assets
```

## Questions?

If you have questions or need help, please:

1. Check existing [Issues](https://github.com/ORIGINAL_OWNER/event-overview/issues)
2. Open a new issue with the `question` label

Thank you for contributing! 🎉
