# Project Guidelines

## Code Style
- Use TypeScript for all components
- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling

## Folder Structure
- `components/admin/` — Admin only components
- `components/teacher/` — Teacher only components
- `components/dashboards/` — Role-based dashboards
- `context/` — Global state management
- `lib/` — External service clients
- `types/` — TypeScript interfaces

## Database
- All data is stored in Supabase PostgreSQL
- Use the AppContext for all data operations
- Never call Supabase directly from components