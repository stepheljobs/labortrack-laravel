# LaborTrack Development Guidelines

## Commands

- **Build**: `yarn build` / `yarn build:ssr`
- **Lint**: `yarn lint` (ESLint) / `composer run lint` (Laravel Pint)
- **Format**: `yarn format` (Prettier) / `composer run format` (Laravel Pint)
- **Type Check**: `yarn types` (TypeScript)
- **Test**: `php artisan test` / `composer test` (Pest)
- **Single Test**: `php artisan test --filter TestName` or `./vendor/bin/pest tests/Feature/SpecificTest.php`

## TypeScript/React

- Strict TypeScript with `noImplicitAny`, `strict: true`
- Import React: `import * as React from "react"` or JSX with `react-jsx`
- Use `@/*` path alias for internal imports (configured in tsconfig.json)
- Components: PascalCase, files: kebab-case
- Use class-variance-authority (cva) for component variants
- Prefer `cn()` utility for conditional classes with Tailwind
- Prettier: single quotes, semicolons, 80 char width, tabWidth: 4

## PHP

- PSR-4 autoloading (`App\` namespace)
- Laravel conventions: Models singular, controllers plural
- Type hints required for parameters and returns
- Use `@var` and `@return` PHPDoc tags
- Mass assignable properties in `$fillable` arrays
- Relationships as methods with proper return types
- Database: snake_case, PHP: camelCase

## Testing & Quality

- Use Pest for testing with descriptive names
- ESLint with React hooks rules enforced
- Run `yarn lint` and `yarn types` before commits
- Follow existing component patterns in resources/js/components
