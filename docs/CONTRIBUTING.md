# Contributing Guidelines

Thank you for considering contributing to "Your Life, In Receipts"! This document provides guidelines and best practices for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Report unacceptable behavior to adityakupmanyu@gmail.com

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Git

### Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/The-Receipt-Trail.git
cd The-Receipt-Trail

# Add upstream remote
git remote add upstream https://github.com/aditya-upmanyu/The-Receipt-Trail.git

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 💻 Development Workflow

### 1. Create a Branch

```bash
# Update main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `perf/` - Performance improvements

### 2. Make Changes

- Write clean, readable code
- Follow TypeScript strict mode
- Add tests for new features
- Update documentation as needed

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commits
git commit -m "feat: add new search filter"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
```

---

## 📝 Coding Standards

### TypeScript

✅ **Do**:
```typescript
// Use explicit types
function processReceipts(receipts: Receipt[]): ProcessedReceipt[] {
  return receipts.map(r => process(r));
}

// Use interfaces for objects
interface UserConfig {
  theme: 'light' | 'dark';
  pageSize: number;
}

// Use const for immutable values
const MAX_ITEMS = 100;
```

❌ **Don't**:
```typescript
// Avoid 'any' type
function process(data: any) { }

// Don't use var
var count = 0;

// Don't ignore errors
try {
  riskyOperation();
} catch (e) { }
```

### React Components

✅ **Do**:
```typescript
// Use functional components
export function ReceiptCard({ receipt }: ReceiptCardProps) {
  return <div>{receipt.title}</div>;
}

// Use memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* ... */}</div>;
});

// Custom hooks for reusable logic
function useDebounced(value: string, delay: number) {
  // ...
}
```

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/          # Route components
├── hooks/          # Custom React hooks
├── services/       # Business logic services
├── utils/          # Pure utility functions
├── types/          # TypeScript definitions
└── tests/          # Test files
```

---

## 🧪 Testing Guidelines

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Connection Detection', () => {
  it('should detect temporal connections', () => {
    const receipt1 = createTestReceipt({ date: new Date('2023-01-01') });
    const receipt2 = createTestReceipt({ date: new Date('2023-01-01') });
    
    const connections = detectConnections([receipt1, receipt2]);
    
    expect(connections).toHaveLength(1);
    expect(connections[0].score).toBeGreaterThan(0.5);
  });
});
```

### Test Coverage Requirements

- All new features must have tests
- Minimum 80% code coverage
- Test both happy path and edge cases
- Mock external dependencies

### Running Tests

```bash
# All tests
npm test

# Specific file
npm test connections.test.ts

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📝 Commit Messages

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance improvements

### Examples

```bash
feat(search): add fuzzy matching algorithm

Implemented Levenshtein distance algorithm for better search results.
Improves user experience when searching with typos.

Closes #123

fix(parser): handle malformed CSV rows

Added try-catch around CSV parsing to gracefully handle malformed data.
Logs errors instead of crashing.

Fixes #456

docs(api): add connection detection examples

Added code examples for all connection detection methods.
Improved API reference documentation.
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] All tests passing (`npm test`)
- [ ] No linter errors (`npm run lint`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests passing
- [ ] Linter passing
- [ ] Documentation updated
- [ ] Conventional commits used
```

### Review Process

1. **Automated Checks**: CI runs tests, linter, type checker
2. **Code Review**: Maintainer reviews code quality, design, tests
3. **Feedback**: Address review comments
4. **Approval**: PR approved by maintainer
5. **Merge**: Squash and merge into main

---

## 🎨 UI/UX Guidelines

### Responsive Design

- Mobile-first approach
- Test on multiple devices
- Use Tailwind responsive utilities (`sm:`, `md:`, `lg:`)

### Accessibility

- Use semantic HTML
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Maintain 4.5:1 color contrast
- Test with screen reader

### Performance

- Lazy load components and routes
- Memoize expensive computations
- Debounce user inputs
- Optimize images
- Monitor bundle size

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)

---

## ❓ Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Email: adityakupmanyu@gmail.com

Thank you for contributing! 🎉
