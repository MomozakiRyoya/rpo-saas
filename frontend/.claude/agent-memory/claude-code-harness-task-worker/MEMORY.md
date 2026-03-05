# RPO-SaaS Frontend - Task Worker Memory

## Critical: localStorage SSR Issue

In Next.js 14 App Router, `localStorage` cannot be accessed during SSR (static prerender).
- WRONG: `const user = authService.getCurrentUser()` at component body level
- CORRECT: Use `useState<User | null>(null)` + `useEffect(() => { setUser(authService.getCurrentUser()) }, [])`
- All `authService.isManager()` / `isAdmin()` calls in `useEffect` work fine (they run client-side only)

## auth.ts Pattern

Role helpers are in `authService`:
- `authService.isAdmin()` - ADMIN only
- `authService.isManager()` - ADMIN or MANAGER
- `authService.isMember()` - any authenticated role
- `authService.getCurrentUser()` - returns User | null from localStorage

## services.ts Import Pattern

When adding new services that use `User` type, add `User` to the import from `@/types`.

## Navbar Role-Based Menus

`getNavSections(role)` function pattern:
- Pass `user?.role` as argument (can be undefined)
- Returns role-filtered NavSection[] array
- Key pattern for list items: `${section.label}-${item.href}` (handles duplicate hrefs across sections)
