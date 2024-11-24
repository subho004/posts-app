# Nested Posts System

A full-stack Next.js application that implements a nested comments/posts system similar to Reddit or Hacker News. Built with Next.js 15, MongoDB, and TypeScript.

## ⚠️ Important Disclaimer

This project uses Next.js 15's new route handlers which are currently experiencing some type definition issues. The workarounds implemented in this project are temporary and may need to be updated when Next.js releases fixes in future versions.

### Known Issues:

- Route handler type definitions in Next.js 15.0.3 may show TypeScript errors during development
- Some type annotations use temporary workarounds to compile successfully
- These issues do not affect runtime functionality but may impact development experience

## Features

- Create, read, update, and delete posts
- Nested comments with configurable depth limit
- Like/dislike functionality
- Sorting by date, likes, and controversy
- Pagination
- Real-time updates
- Responsive design

## Prerequisites

- Node.js 18.17 or later
- MongoDB instance (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/subho004/posts-app.git
cd nested-posts-system
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
```

4. Run the development server:

```bash
npm run dev
```

## Environment Variables

| Variable    | Description               | Required |
| ----------- | ------------------------- | -------- |
| MONGODB_URI | MongoDB connection string | Yes      |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── posts/
│   │       ├── route.ts
│   │       └── [postId]/
│   │           ├── route.ts
│   │           ├── vote/
│   │           └── comments/
│   └── page.tsx
├── components/
│   └── posts/
│       ├── PostCard.tsx
│       └── Comments.tsx
├── lib/
│   └── db.ts
└── models/
    └── Post.ts
```

## API Routes

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | /api/posts               | Get all posts           |
| POST   | /api/posts               | Create a new post       |
| GET    | /api/posts/[id]          | Get a specific post     |
| PUT    | /api/posts/[id]          | Update a post           |
| DELETE | /api/posts/[id]          | Delete a post           |
| GET    | /api/posts/[id]/comments | Get comments for a post |
| POST   | /api/posts/[id]/vote     | Vote on a post          |

## Development Notes

1. The project uses temporary type workarounds for Next.js 15 route handlers:

```typescript
type HandlerContext = any; // Temporary fix for Next.js 15 route handler types

export async function GET(request: Request, context: HandlerContext) {
  // ...
}
```

2. When updating route handlers, keep the workaround in place until Next.js fixes the type definitions.

3. Run TypeScript checks before committing:

```bash
npm run typecheck
```

## Known Limitations

- Route handler type definitions require workarounds in Next.js 15.0.3
- Depth of nested comments is limited to 5 levels for performance
- Authentication is simulated with a hardcoded user ID

## Future Improvements

- [ ] Add proper authentication
- [ ] Implement real-time updates with WebSockets
- [ ] Add comment editing timestamps
- [ ] Implement user profiles
- [ ] Add image upload support
- [ ] Add markdown support for posts
- [ ] Implement search functionality
