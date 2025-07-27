# Batch Scheduler MVP

A modern web application to replace Excel spreadsheets for batch scheduling operations.

## Project Structure

```
batch-scheduler-mvp/
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── package.json
├── backend/           # Node.js Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── utils/
│   │   └── config/
│   └── package.json
└── package.json       # Root workspace configuration
```

## Tech Stack

- **Frontend**: React 18 with TypeScript, React Router
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL (to be configured)
- **Development**: Concurrently for running both frontend and backend

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd batch-scheduler-mvp
```

2. Install all dependencies:
```bash
npm run install:all
```

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

### Individual Services

Start only the frontend:
```bash
npm run dev:frontend
```

Start only the backend:
```bash
npm run dev:backend
```

## Available Scripts

### Root Level
- `npm run install:all` - Install dependencies for all workspaces
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run lint` - Run linting for both projects
- `npm run lint:fix` - Fix linting issues for both projects
- `npm run test` - Run tests for both projects
- `npm run clean` - Remove all node_modules and build directories

### Frontend Specific
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production

### Backend Specific
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend for production

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /health` - Health check endpoint
- `GET /api` - API information
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create a new batch
- `GET /api/batches/:id` - Get a specific batch
- `PUT /api/batches/:id` - Update a batch
- `DELETE /api/batches/:id` - Delete a batch

## Environment Configuration

1. Copy the environment example file:
```bash
cp backend/.env.example backend/.env
```

2. Update the environment variables as needed for your setup.

## Database Setup

PostgreSQL configuration will be added in future iterations. The application currently runs with mock data.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests: `npm run lint && npm run test`
4. Build the project: `npm run build`
5. Submit a pull request

## License

ISC