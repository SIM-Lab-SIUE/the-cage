# Contributing to The Cage

Thank you for your interest in contributing to The Cage! We welcome contributions from the SIUE community and beyond. This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check if the issue already exists** in [GitHub Issues](../../issues)
2. **Provide detailed information:**
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment details (OS, Node version, Docker version)
   - Screenshots/logs if applicable

### Suggesting Features

1. **Check existing discussions** to avoid duplicates
2. **Provide clear context:**
   - Use case and motivation
   - How it benefits users
   - Possible implementation approach (optional)

### Code Contributions

#### Setup Development Environment

1. **Fork the repository:**
   ```bash
   git clone https://github.com/your-username/the-cage.git
   cd the-cage
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

#### Code Standards

- **TypeScript First**: All new code must be written in TypeScript
- **Naming Conventions**:
  - `camelCase` for functions, variables, and object properties
  - `PascalCase` for React components and classes
  - `UPPER_SNAKE_CASE` for constants
  
- **Component Structure**:
  - Keep components under 300 lines
  - Extract reusable logic into separate utilities
  - Include JSDoc comments for props and return types

```typescript
/**
 * EquipmentCard - Displays equipment details with availability
 * @param name - Equipment name
 * @param status - Current availability status
 * @returns React component
 */
export default function EquipmentCard({ name, status }: Props) {
  // Implementation
}
```

- **Error Handling**: Always handle errors gracefully
```typescript
try {
  const result = await fetchData();
  // Process result
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Return user-friendly error state
}
```

#### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Check coverage
npm test -- --coverage
```

All new features should include corresponding tests.

#### Linting & Formatting

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable errors
npm run lint -- --fix
```

#### Build Verification

```bash
# Ensure build succeeds
npm run build
```

### Git Workflow

1. **Commit Messages**: Use clear, descriptive messages
   ```
   feat: Add QR code generation for reservations
   fix: Resolve database connection timeout
   docs: Update API endpoint documentation
   refactor: Simplify availability checking logic
   ```

2. **Keep commits focused**: One feature/fix per commit
3. **Update related documentation**: README, DEVELOPER_LOG, etc.

4. **Push and create Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Process

1. **Update README.md** if adding new features or changing usage
2. **Add tests** for new functionality
3. **Ensure CI passes**:
   - `npm run lint` ✓
   - `npm run build` ✓
   - `npm test` ✓

4. **Describe your changes:**
   - What problem does this solve?
   - How was it tested?
   - Any breaking changes?

5. **Link related issues:** "Fixes #123"

## 📋 Pull Request Checklist

- [ ] TypeScript has no errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (README, comments, logs)
- [ ] No hardcoded secrets or credentials
- [ ] Commit messages are clear and descriptive
- [ ] Related issue(s) are referenced

## 🏗️ Project Structure Guidelines

When adding new features:

- **New API endpoints**: `src/app/api/[feature]/route.ts`
- **New components**: `src/components/[FeatureName].tsx`
- **New services**: `src/services/[feature]-service.ts`
- **New utilities**: `src/lib/[feature]-utils.ts`
- **Database models**: Update `prisma/schema.prisma` and run `npx prisma migrate dev`

## 🔐 Security Guidelines

- **Never commit `.env` files** containing secrets
- **Use environment variables** for all configuration
- **Validate user input** on both client and server
- **Sanitize outputs** to prevent XSS attacks
- **Use HTTPS** in production
- **Keep dependencies updated**: `npm audit` and `npm update`

## 📚 Documentation

Good documentation is critical:

- **Inline Comments**: Explain "why", not "what"
- **JSDoc Comments**: Document functions and components
- **README Updates**: Keep installation/setup current
- **DEVELOPER_LOG Updates**: Record architectural decisions
- **Type Annotations**: Use TypeScript types instead of relying on inference

## 🚀 Performance Considerations

- **Image Optimization**: Use `next/image` component
- **Database Queries**: Use Prisma caching and `select` for specific fields
- **API Calls**: Implement request deduplication
- **Bundle Size**: Monitor with `npm run build`
- **Component Memoization**: Use `React.memo()` for expensive renders

## 🐛 Debugging Tips

- **Enable Prisma logging:**
  ```typescript
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  ```

- **Docker debugging:**
  ```bash
  docker compose logs -f nextjs-app
  docker compose logs -f snipeit
  ```

- **React DevTools**: Install browser extension for debugging

## 💡 Architectural Principles

The Cage follows these architectural patterns:

1. **API Wall**: Service layer decouples frontend from Snipe-IT
2. **Shadow Database**: Local Prisma DB complements Snipe-IT
3. **"Code for the Pivot"**: Business logic optimized for speed, abstracted for commercialization
4. **White-Label Design**: Centralized branding config
5. **Container Assets**: Parent assets represent kits

When contributing, please respect these patterns.

## 📞 Questions or Need Help?

- **Check Documentation**: [README.md](./README.md), [DEVELOPER_LOG.md](./DEVELOPER_LOG.md)
- **Review Examples**: Look at similar existing code
- **Ask in Issues**: Create a discussion issue if stuck
- **GitHub Discussions**: For non-bug conversations

## 🙏 Code Review Process

- Reviews typically take 1-2 business days
- Constructive feedback is provided to help improve code
- Small changes can be merged faster
- Large architectural changes require more discussion

Thank you for contributing to The Cage! 🎬

---

**Last Updated**: December 2025
