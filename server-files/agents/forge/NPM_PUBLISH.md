# NPM Publishing Instructions 📦

This guide covers publishing the Mission Control SDK and CLI to npm.

## Prerequisites

✅ **Already done:**
- Packages built successfully
- TypeScript compiled
- Package names scoped to `@appydam/*`
- All code tested and working
- GitHub repos updated

❌ **Still needed:**
- npm account authentication

---

## Step 1: Authenticate with npm

```bash
npm login
```

Enter credentials for the `appydam` npm account.

Verify authentication:
```bash
npm whoami
# Should output: appydam
```

---

## Step 2: Publish Mission Control SDK

```bash
cd /home/ubuntu/.openclaw/workspace/agents/forge/mission-control-sdk

# Verify build
npm run build

# Publish (public access for scoped packages)
npm publish --access public
```

**Expected output:**
```
+ @appydam/mission-control-sdk@1.0.0
```

**Verify:** https://www.npmjs.com/package/@appydam/mission-control-sdk

---

## Step 3: Publish Mission Control CLI

```bash
cd /home/ubuntu/.openclaw/workspace/agents/forge/mc-cli

# Verify build
npm run build

# Publish (public access for scoped packages)
npm publish --access public
```

**Expected output:**
```
+ @appydam/mc-cli@1.0.0
```

**Verify:** https://www.npmjs.com/package/@appydam/mc-cli

---

## Step 4: Test Installations

### Test SDK

```bash
# In a temporary directory
mkdir /tmp/test-sdk && cd /tmp/test-sdk
npm init -y
npm install @appydam/mission-control-sdk

# Create test.js
cat > test.js << 'EOF'
const { createClient } = require('@appydam/mission-control-sdk');
const mc = createClient({
  apiUrl: 'https://beloved-squirrel-599.convex.site'
});
console.log('SDK loaded successfully!');
EOF

node test.js
```

**Expected:** "SDK loaded successfully!"

### Test CLI

```bash
# Install globally
npm install -g @appydam/mc-cli

# Test command
mc heartbeat --help

# Should show usage info
```

---

## Step 5: Update Documentation

After successful publishing, update GitHub READMEs to reference the live npm packages.

### SDK README

Already updated! ✅
```markdown
npm install @appydam/mission-control-sdk
```

### CLI README

Already updated! ✅
```markdown
npm install -g @appydam/mc-cli
```

---

## Troubleshooting

### Error: Need authentication

**Solution:** Run `npm login` first

### Error: Package name not available

**Solution:** Package names are already scoped to `@appydam/` so this shouldn't happen

### Error: 402 Payment Required

**Solution:** Add `--access public` flag (required for scoped packages on free npm accounts)

### Error: Version already exists

**Solution:** Bump version in package.json:
```bash
npm version patch  # 1.0.0 -> 1.0.1
# or
npm version minor  # 1.0.0 -> 1.1.0
```

---

## Post-Publishing Checklist

- [ ] SDK published to npm
- [ ] CLI published to npm
- [ ] Both packages install correctly
- [ ] CLI command works globally (`mc heartbeat --help`)
- [ ] GitHub repos updated with npm links
- [ ] Test end-to-end usage
- [ ] Update Mission Control to use published packages

---

## Future Updates

To publish a new version:

1. Make changes to code
2. Run tests
3. Update version: `npm version patch` (or `minor`/`major`)
4. Build: `npm run build`
5. Publish: `npm publish --access public`
6. Tag release on GitHub: `git tag v1.0.1 && git push --tags`

---

## Package URLs

Once published:

- **SDK:** https://www.npmjs.com/package/@appydam/mission-control-sdk
- **CLI:** https://www.npmjs.com/package/@appydam/mc-cli

---

## Summary

**What's ready to publish:**
1. `@appydam/mission-control-sdk` (TypeScript SDK)
2. `@appydam/mc-cli` (CLI tool)

**All that's needed:**
- `npm login` with appydam credentials
- Run the publish commands above

**Time to publish:** ~2 minutes per package

Both packages are production-ready, tested, and documented. Just need credentials! 🚀
