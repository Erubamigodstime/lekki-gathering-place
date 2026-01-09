# Testing & Quality Assurance Setup

## Test Infrastructure

### Installation

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

### Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `src/test/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### Running Tests

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Run tests:
```bash
npm test              # Run in watch mode
npm run test:ui       # Open UI
npm run test:coverage # Generate coverage report
```

## Current Test Coverage

### Implemented Tests

1. **InstructorSpotlight.test.tsx** ✅
   - Component rendering
   - Instructor data display
   - Button interactions
   - Accessibility attributes

2. **InstructorProfile.test.tsx** ✅
   - Profile data rendering
   - Navigation handling
   - 404 error state
   - Other instructors section
   - Semantic HTML/ARIA

### Test Coverage Goals

- **Target**: 70%+ coverage
- **Critical paths**: 100%
- **UI components**: 80%+
- **Utilities**: 90%+

## Additional Tests Needed

### Unit Tests

```typescript
// src/__tests__/instructors.test.ts
describe('Instructors Data', () => {
  it('has valid data structure', () => {
    instructors.forEach(instructor => {
      expect(instructor).toHaveProperty('id');
      expect(instructor).toHaveProperty('name');
      expect(instructor.rating).toBeGreaterThan(0);
      expect(instructor.rating).toBeLessThanOrEqual(5);
    });
  });
});

// src/__tests__/monitoring.test.ts
describe('Error Tracker', () => {
  it('logs errors correctly', () => {
    const error = new Error('Test error');
    errorTracker.logError(error);
    expect(errorTracker.getErrors()).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
// src/__tests__/integration/navigation.test.tsx
describe('Navigation Flow', () => {
  it('navigates from home to instructor profile', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const viewButton = screen.getAllByText(/View Profile/i)[0];
    await user.click(viewButton);
    
    expect(screen.getByText('Francis Happy')).toBeInTheDocument();
  });
});
```

### E2E Tests (Future)

Use Playwright or Cypress:

```typescript
// e2e/instructor-profile.spec.ts
test('instructor profile page loads correctly', async ({ page }) => {
  await page.goto('/instructor/francis-happy');
  await expect(page.locator('h1')).toContainText('Francis Happy');
  await expect(page.locator('img')).toBeVisible();
});
```

## Monitoring & Error Tracking

### Current Implementation

✅ **Error Boundary** - Catches React errors
✅ **Error Tracker** - Logs errors locally
✅ **Analytics** - Tracks user events
✅ **Performance Monitor** - Measures load times

### Production Monitoring Setup

#### 1. Sentry Integration (Recommended)

```bash
npm install @sentry/react
```

Update `src/main.tsx`:

```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  });
}
```

#### 2. Google Analytics 4

```typescript
// src/utils/ga4.ts
export const initGA = () => {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', import.meta.env.VITE_GA_ID);
};
```

## Accessibility Testing

### Automated Testing

```bash
npm install --save-dev @axe-core/react
```

Add to development:

```typescript
// src/main.tsx
if (import.meta.env.DEV) {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing Checklist

- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Skip links work
- [ ] ARIA landmarks present

### Tools

- **WAVE** - Browser extension
- **axe DevTools** - Browser extension  
- **Lighthouse** - Chrome DevTools
- **NVDA/JAWS** - Screen readers

## Performance Testing

### Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

Create `.lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

Run:
```bash
npm run build
npx lhci autorun
```

### Bundle Size Monitoring

```bash
npm install --save-dev vite-bundle-visualizer
```

Add to `vite.config.ts`:

```typescript
import { visualizer } from 'vite-bundle-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
  ],
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Monitoring Dashboard

### Recommended Services

1. **Sentry** - Error tracking ($0-$26/month)
2. **LogRocket** - Session replay ($99/month)
3. **Google Analytics** - Free
4. **Vercel Analytics** - Free with Vercel hosting

## Quality Gates

### Pre-Commit

```bash
npm install --save-dev husky lint-staged
```

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

### Pre-Push

- All tests must pass
- Coverage > 70%
- No TypeScript errors
- Build succeeds

## Conclusion

**Current Status**: Basic testing infrastructure in place
**Next Steps**:
1. Run `npm install` for test dependencies
2. Create vitest.config.ts
3. Run existing tests: `npm test`
4. Add more test coverage
5. Set up Sentry for production

**Goal**: 70%+ test coverage before production deployment
