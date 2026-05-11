# EduManage — Development Guidelines

## Code Style
- Use TypeScript for all components — no `any` types
- Use functional components with React hooks only
- Use Tailwind CSS for all styling — no inline styles
- Use async/await for all Supabase operations

## Component Rules
- All state must go through AppContext — never call Supabase directly from components
- Always show loading states during async operations
- Always show toast notifications on success and error using sonner
- Never use early returns before useState hooks (React Rules of Hooks)

## Folder Structure
- components/admin/ — Admin only components
- components/teacher/ — Teacher only components
- components/student/ — Student only components
- components/parent/ — Parent only components
- components/dashboards/ — Role-based dashboard pages
- context/ — Global state management
- lib/ — External service clients
- types/ — TypeScript interfaces only

## Security
- Never hardcode API keys — use .env.local
- .env.local is in .gitignore and must never be committed
- Passwords must be minimum 8 characters
- Use type=password for all password inputs