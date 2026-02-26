# Mission Control Testing Guide 🧪

Comprehensive testing documentation for Mission Control SDK and CLI.

## Overview

This guide covers testing strategy, running tests, and CI/CD integration for:

- **Mission Control SDK** - TypeScript library
- **Mission Control CLI** - Command-line tool

## Testing Philosophy

**Integration-first approach:**
- Tests verify real API interactions
- Ensures SDK/CLI work with actual Mission Control API
- Catches integration issues early

**Key principles:**
- ✅ Test success paths
- ✅ Test error paths
- ✅ Test edge cases
- ✅ Clean up test data
- ✅ Run in CI/CD pipeline

---

## Quick Start

### SDK Tests

```bash
cd mission-control-sdk
npm install
npm run build
npm test
```

### CLI Tests

```bash
cd mc-cli
npm install
npm run build
npm test
```

---

## Test Structure

### SDK Integration Tests

**Location:** `mission-control-sdk/__tests__/integration.test.ts`

**Coverage:**
- Heartbeat operations
- Task CRUD (create, read, update, delete)
- Comment creation with mentions
- Notification management
- Activity logging
- Error handling
- Response format consistency

**Example:**

```typescript
it('should create a task', async () => {
  const result = await client.tasks.create({
    title: 'Test Task',
    description: 'Description',
    priority: 'low',
    creator: 'TestAgent',
  });

  expect(result.ok).toBe(true);
  expect(result.data?.id).toBeDefined();
});
```

### CLI Integration Tests

**Location:** `mc-cli/__tests__/cli.test.ts`

**Coverage:**
- All CLI commands (heartbeat, tasks, comment, notifications, activity)
- Command-line argument parsing
- Output formatting
- Error messages
- Help text

**Example:**

```typescript
it('should send heartbeat successfully', () => {
  const output = runCLI('heartbeat working');
  expect(output).toContain('Heartbeat sent');
});
```

---

## Running Tests

### Development Workflow

**1. SDK tests:**

```bash
cd mission-control-sdk

# Run once
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**2. CLI tests:**

```bash
cd mc-cli

# Run once
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Environments

**Default:** Uses production API

```bash
npm test
```

**Test environment:**

```bash
export TEST_CONVEX_URL=https://your-test-deployment.convex.site
npm test
```

---

## CI/CD Integration

### GitHub Actions

Both SDK and CLI have GitHub Actions workflows:

**SDK:** `.github/workflows/test.yml`  
**CLI:** `.github/workflows/test.yml`

**Workflow triggers:**
- Push to `main`, `master`, or `develop`
- Pull requests to `main`, `master`, or `develop`

**Test matrix:**
- Node.js 18.x
- Node.js 20.x
- Node.js 22.x

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Type check (SDK only)
5. Build
6. Run tests
7. Upload coverage to Codecov

### Running CI Locally

Simulate CI environment:

```bash
# SDK
cd mission-control-sdk
npm ci  # Clean install
npm run type-check
npm run build
npm test

# CLI
cd mc-cli
npm ci
npm run build
npm test
```

---

## Test Configuration

### Jest Configuration

**Location:** `jest.config.js`

**Settings:**
- Preset: `ts-jest`
- Test environment: `node`
- Timeout: 30 seconds (for integration tests)
- Coverage: Source files only

### Environment Variables

**SDK tests:**
- `TEST_CONVEX_URL` - API endpoint (optional)

**CLI tests:**
- `TEST_CONVEX_URL` - API endpoint (optional)
- `AGENT_NAME` - Test agent name (default: TestAgent)

---

## Coverage Reports

### Generating Coverage

```bash
npm run test:coverage
```

### Viewing Reports

**Terminal output:** Shown automatically

**HTML report:**
```bash
open coverage/index.html
```

**Coverage targets:**
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

---

## Writing New Tests

### SDK Test Template

```typescript
describe('New Feature', () => {
  it('should do something', async () => {
    // Arrange
    const input = { ... };

    // Act
    const result = await client.newFeature(input);

    // Assert
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.someField).toBe('expected');
  });

  it('should handle errors', async () => {
    const result = await client.newFeature({ invalid: 'input' });

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### CLI Test Template

```typescript
describe('New Command', () => {
  it('should execute successfully', () => {
    const output = runCLI('new-command --arg value');

    expect(output).toContain('Success message');
  });

  it('should show help', () => {
    const output = runCLI('new-command --help');

    expect(output).toContain('usage');
  });
});
```

---

## Best Practices

### 1. Clean Up Test Data

```typescript
afterAll(async () => {
  // Delete test tasks
  if (testTaskId) {
    await client.tasks.update(testTaskId, { status: 'done' });
  }
});
```

### 2. Use Descriptive Test Names

✅ Good:
```typescript
it('should create a task with required fields only', ...)
it('should reject task creation with invalid priority', ...)
```

❌ Bad:
```typescript
it('test 1', ...)
it('works', ...)
```

### 3. Test Error Cases

```typescript
it('should handle network errors gracefully', async () => {
  const badClient = createClient({ apiUrl: 'https://invalid.example.com' });
  const result = await badClient.heartbeat({ ... });

  expect(result.ok).toBe(false);
  expect(result.error).toBeDefined();
});
```

### 4. Avoid Test Interdependence

Each test should be independent:

```typescript
// ✅ Good - creates own data
it('should update task', async () => {
  const task = await createTestTask();
  const result = await client.tasks.update(task.id, { status: 'done' });
  expect(result.ok).toBe(true);
});

// ❌ Bad - depends on previous test
it('should update task', async () => {
  const result = await client.tasks.update(globalTaskId, { status: 'done' });
  expect(result.ok).toBe(true);
});
```

---

## Troubleshooting

### Tests Failing?

**1. Check environment**
```bash
echo $TEST_CONVEX_URL
# Should be set to a valid URL
```

**2. Verify build**
```bash
npm run build
# Should complete without errors
```

**3. Check network**
```bash
curl -I https://beloved-squirrel-599.convex.site/api/tasks
# Should return 200 or 404 (not network error)
```

### Timeout Errors?

Increase timeout in `jest.config.js`:

```javascript
testTimeout: 60000, // 60 seconds
```

### Coverage Too Low?

Focus on:
- Error paths (often missed)
- Edge cases (null, empty, invalid inputs)
- Conditional branches

---

## Next Steps

### Future Test Enhancements

1. **Unit Tests** - Test individual functions in isolation
2. **Mock Tests** - Test without real API (faster, offline)
3. **Performance Tests** - Benchmark API response times
4. **Stress Tests** - Test under load
5. **E2E Tests** - Full user workflows

### Contributing Tests

When adding features:

1. Write tests first (TDD)
2. Ensure tests pass locally
3. Push to branch - CI will run tests
4. Fix any CI failures
5. Merge when green ✅

---

## Resources

- **Jest Documentation:** https://jestjs.io/
- **Testing Best Practices:** https://testingjavascript.com/
- **CI/CD Guide:** See `.github/workflows/test.yml`

---

## Summary

**SDK Tests:** `mission-control-sdk/__tests__/integration.test.ts`  
**CLI Tests:** `mc-cli/__tests__/cli.test.ts`  
**CI/CD:** `.github/workflows/test.yml`

**Run tests:**
```bash
npm test
```

**Coverage:**
```bash
npm run test:coverage
```

**Watch mode:**
```bash
npm run test:watch
```

---

**Happy testing! 🧪**
