# 🚀 Quick Start Guide

Get up and running with the Invoice Generator development environment in minutes.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)

## ⚡ Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/borecz/invoice-generator.git
cd invoice-generator

# 2. Install dependencies
npm install

# 3. Install Supabase CLI (if not already installed)
npm install -g supabase

# 4. Validate workflow setup
npm run workflow:validate

# 5. Start development environment
npm run dev
```

That's it! Your development environment should now be running at http://localhost:3001

## 🔧 What Just Happened?

The `npm run dev` command automatically:
- ✅ Switches to local environment (safe for development)
- ✅ Starts local Supabase database
- ✅ Applies all database migrations
- ✅ Starts the Next.js development server

## 🧪 Verify Everything Works

```bash
# Run all tests to ensure everything is working
npm run test:all
```

## 📚 Next Steps

### Learn the Workflow
- Read [Development Workflow Guide](./docs/DEVELOPMENT-WORKFLOW.md)
- Understand [Testing Documentation](./docs/TESTING.md)

### Key Commands to Remember
```bash
# Development
npm run dev              # Start development (local database)
npm run env:status       # Check current environment

# Database
npm run db:status        # Check database status
npm run db:studio        # Open database dashboard

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:all         # Run all tests
```

### Development Workflow
1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit code, add features
3. **Write Tests**: Add unit tests (.test.ts) and E2E tests (.spec.ts)
4. **Run Tests**: `npm run test:all`
5. **Ensure Tests Pass**: All green before considering feature complete

## 🆘 Troubleshooting

### Common Issues

**Port 3001 already in use?**
```bash
# Use a different port
npm run dev:alt
```

**Database connection issues?**
```bash
# Check database status
npm run db:status

# Restart database if needed
npm run db:stop
npm run db:start
```

**Environment confusion?**
```bash
# Check current environment
npm run env:status

# Switch to local (safe) environment
npm run env:switch local
```

**Tests failing?**
```bash
# Ensure using local database
npm run env:switch local
npm run db:reset
npm run test:all
```

### Get Help

- 📖 [Full Documentation](./docs/DEVELOPMENT-WORKFLOW.md)
- 🧪 [Testing Guide](./docs/TESTING.md)
- 🔧 [Workflow Validation](npm run workflow:validate)

## 🎯 Development Principles

- **Local First**: Always develop with local database
- **Test Everything**: Write unit + E2E tests for every feature
- **Safety First**: Never accidentally test against production
- **Consistent Environment**: Same setup for all developers

---

**Ready to start developing?** Run `npm run dev` and start building! 🚀
