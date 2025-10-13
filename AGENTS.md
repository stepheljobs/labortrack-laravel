# LaborTrack Development Guidelines

## Commands

- **Build**: `yarn build` / `make build-frontend`
- **Lint**: `yarn lint` (ESLint) / `make lint` (includes PHPStan)
- **Format**: `yarn format` (Prettier) / `make format` (Laravel Pint)
- **Type Check**: `yarn types` (TypeScript)
- **Test**: `php artisan test` / `make test` (Pest/PHPUnit)
- **Single Test**: `php artisan test --filter TestName` or `./vendor/bin/pest tests/Feature/SpecificTest.php`

## Code Style

### TypeScript/React

- Use strict TypeScript with `noImplicitAny`
- Import React components: `import * as React from "react"`
- Use `@/*` path alias for internal imports
- Components use PascalCase, files use kebab-case
- Use class-variance-authority (cva) for component variants
- Prefer `cn()` utility for conditional classes with Tailwind

### PHP

- Follow PSR-4 autoloading (`App\` namespace)
- Use Laravel conventions: Models in singular, controllers in plural
- Type hints required for method parameters and returns
- Use `@var` and `@return` PHPDoc tags
- Mass assignable properties in `$fillable` arrays
- Relationships defined as methods with proper return types

### General

- Prettier config: single quotes, semicolons, 80 char width
- ESLint with React hooks rules enforced
- Use Pest for testing with descriptive test names
- Follow Laravel naming conventions (snake_case for DB, camelCase for PHP)
