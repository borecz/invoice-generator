# Development Workflow Guide

This document outlines the comprehensive development workflow for the Invoice Generator application, ensuring consistent local development practices, proper database management, and thorough testing.

## 🎯 Core Principles

1. **Local Development First**: Always use local Supabase for development and testing
2. **Test-Driven Development**: Write tests for every feature (unit + E2E)
3. **Database Safety**: Never accidentally test against production
4. **Consistent Environment**: Standardized development setup across all developers

## 🚀 Quick Start

```bash
# 1. Start local development environment
npm run dev:local

# 2. Run all tests to ensure everything works
npm run test:all

# 3. Start developing your feature
```

## 📋 Environment Management

### Available Environments

- **Local** (default): Uses local Supabase instance - safe for development
- **Remote**: Uses production Supabase - use only when necessary

### Environment Commands

```bash
# Check current environment
npm run env:status

# Switch to local environment (default)
npm run env:switch local

# Switch to remote environment (use with caution)
npm run env:switch remote

# Show help
npm run env:switch help
```

### Environment Safety

- ✅ **Local environment**: Safe for all development and testing
- ⚠️ **Remote environment**: Production database - use only when specifically needed
- 🛡️ **Test environment**: Always uses local database regardless of dev environment

## 🗄️ Database Management

### Local Database Commands

```bash
# Start local Supabase
npm run db:start

# Check status
npm run db:status

# Reset database with all migrations
npm run db:reset

# Apply migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Generate TypeScript types
npm run db:types

# Open Supabase Studio
npm run db:studio

# Stop local Supabase
npm run db:stop
```

### Migration Workflow

1. **Create Migration**: Use Supabase CLI or write SQL manually
2. **Test Locally**: Apply and test migration on local database
3. **Write Tests**: Create tests that verify the migration works
4. **Deploy**: Only deploy to remote after thorough local testing

```bash
# Example migration workflow
npm run db:reset          # Start with clean state
npm run db:migrate        # Apply your new migration
npm run test:all          # Ensure all tests pass
npm run db:types          # Update TypeScript types
```

## 🧪 Testing Strategy

### Test Types

1. **Unit Tests** (`.test.ts`): Business logic, utilities, hooks
2. **E2E Tests** (`.spec.ts`): User workflows, integration testing

### Testing Commands

```bash
# Run all tests (unit + E2E)
npm run test:all

# Unit tests only
npm run test
npm run test:watch
npm run test:coverage

# E2E tests only
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:fast

# Accessibility tests
npm run test:e2e:a11y

# Email testing
npm run test:email

# Test with local database (default)
npm run test:local

# Test with remote database (use with caution)
npm run test:remote
```

### Test Development Guidelines

1. **Always use local database** for testing
2. **Write unit tests** for business logic as you develop
3. **Write E2E tests** for user-facing functionality
4. **Use ARIA snapshots** instead of visual regression testing
5. **Follow authentication patterns** with storageState
6. **Ensure test isolation** and proper cleanup

## 🔄 Feature Development Process

### Step-by-Step Workflow

1. **Setup Environment**
   ```bash
   npm run db:start          # Start local Supabase
   npm run env:status        # Verify using local environment
   npm run dev:local         # Start development server
   ```

2. **Develop Feature**
   - Write business logic
   - Create UI components
   - Implement database operations

3. **Write Tests**
   ```bash
   # Write unit tests for business logic
   touch src/features/my-feature/my-feature.test.ts
   
   # Write E2E tests for user workflows
   touch tests/my-feature.spec.ts
   ```

4. **Test Thoroughly**
   ```bash
   npm run test              # Run unit tests
   npm run test:e2e          # Run E2E tests
   npm run test:all          # Run all tests
   ```

5. **Verify Database Changes**
   ```bash
   npm run db:types          # Update TypeScript types
   npm run db:reset          # Test with fresh database
   npm run test:all          # Ensure tests still pass
   ```

6. **Ready for Review**
   - All tests passing ✅
   - Database migrations tested ✅
   - TypeScript types updated ✅
   - Documentation updated ✅

### Development Scripts

```bash
# Development with local database (default)
npm run dev:local

# Development with remote database (use with caution)
npm run dev:remote

# Development with port 3001 (if 3000 is busy)
npm run dev:alt
```

## 🔒 Safety Measures

### Preventing Production Data Pollution

1. **Environment Isolation**: Tests always use local database
2. **Clear Indicators**: Environment status commands show current setup
3. **Backup System**: Automatic backups when switching environments
4. **Warning Messages**: Clear warnings when using remote database

### Best Practices

- ✅ Always start with `npm run env:status` to check environment
- ✅ Use `npm run dev:local` for development (default)
- ✅ Run `npm run test:all` before considering feature complete
- ✅ Apply migrations locally first, then deploy to remote
- ❌ Never run tests against production database
- ❌ Never develop directly against remote database unless necessary

## 📊 Monitoring and Debugging

### Development Tools

```bash
# Open Supabase Studio (local database dashboard)
npm run db:studio

# View database status
npm run db:status

# Check current environment
npm run env:status

# Debug E2E tests
npm run test:e2e:ui
npm run test:e2e:debug
```

### Troubleshooting

1. **Database Connection Issues**
   ```bash
   npm run db:status         # Check if Supabase is running
   npm run db:start          # Start if not running
   npm run db:reset          # Reset if corrupted
   ```

2. **Environment Issues**
   ```bash
   npm run env:status        # Check current environment
   npm run env:switch local  # Switch to local if needed
   ```

3. **Test Failures**
   ```bash
   npm run test:e2e:ui       # Debug E2E tests visually
   npm run test:coverage     # Check unit test coverage
   ```

## 🚀 Deployment Preparation

Before deploying to production:

1. ✅ All tests pass locally
2. ✅ Database migrations tested locally
3. ✅ TypeScript types updated
4. ✅ No console errors or warnings
5. ✅ Accessibility tests pass
6. ✅ Email functionality tested (if applicable)

```bash
# Pre-deployment checklist
npm run test:all          # All tests pass
npm run build             # Build succeeds
npm run lint              # No linting errors
npm run validate:translations  # Translations valid
```

## 📚 Additional Resources

- [Testing Documentation](./TESTING.md)
- [Accessibility Testing](../ACCESSIBILITY-TESTING-IMPLEMENTATION.md)
- [Email Testing](../EMAIL-TESTING-IMPLEMENTATION.md)
- [Notifications System](./NOTIFICATIONS.md)

---

**Remember**: This workflow ensures consistent, safe, and thorough development practices. Always follow these guidelines for every feature, bug fix, or enhancement.
