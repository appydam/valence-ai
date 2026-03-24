# Contributing to Valence AI

Thanks for your interest in contributing! Valence AI is an open-source autonomous AI agent platform, and we welcome contributions of all kinds.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and fill in your keys
5. Start Convex: `npx convex dev`
6. Start the frontend: `npm run dev`

## Development Setup

**Prerequisites:**
- Node.js 18+
- npm
- A free [Convex](https://convex.dev) account
- A free [Clerk](https://clerk.com) account
- An Anthropic API key (for agent features)

**Tech stack:**
- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Convex (serverless functions + real-time database)
- Auth: Clerk
- Agent runtime: OpenClaw

## How to Contribute

### Reporting Bugs
- Open an issue with a clear title and description
- Include steps to reproduce, expected behavior, and actual behavior
- Include screenshots or error logs if relevant

### Suggesting Features
- Open an issue with the `feature-request` label
- Describe the use case and why it would be valuable
- If possible, outline a rough implementation approach

### Submitting Code

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes
3. Ensure the build passes: `npm run build`
4. Ensure TypeScript is clean: `npx tsc --noEmit`
5. Commit with a descriptive message
6. Push to your fork and open a pull request

### Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Write a clear description of what changed and why
- Update documentation if your change affects setup or usage
- Don't include unrelated formatting or refactoring changes

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling (no custom CSS unless necessary)
- Convex conventions: `_id` not `id`, `_creationTime` not `createdAt`
- Use `useQuery` with `?? []` pattern for loading states

## Areas Where Help is Welcome

- New integration blueprints (add support for more APIs)
- UI/UX improvements
- Documentation and setup guides
- Bug fixes and performance improvements
- Testing
- Accessibility improvements

## Questions?

Open an issue or reach out at arpitdhamija.ai@gmail.com.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
