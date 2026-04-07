# API Security Gateway

A comprehensive rate limiting and abuse detection system built with Node.js, Express, Redis, and React.

## Features

- **Rate Limiting**: Configurable per-IP request limits with sliding window
- **Abuse Detection**: Exponential backoff blocking for repeat offenders
- **Real-time Monitoring**: Redis-backed performance tracking
- **Health Checks**: System monitoring and uptime tracking
- **Dashboard**: Interactive React frontend for visualization
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

### Backend
- Node.js 18+
- Express.js
- TypeScript
- Redis 7
- Winston Logger

### Frontend
- React 18
- TypeScript
- Axios
- Vite

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Redis (or use Docker)

### Development Setup

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173

### Docker Setup

```bash
docker-compose up -d
```

Access the API at http://localhost:3000

## Configuration

Create `.env` in backend folder:

```
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
RATE_LIMIT=100
RATE_LIMIT_WINDOW=60
LOG_LEVEL=info
LOG_DIR=logs
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/test | Test endpoint |
| GET | /api/status | Get rate limit status |
| GET | /api/monitor | Monitor system health |

## Rate Limiting

- **Default Limit**: 100 requests per minute per IP
- **Window**: 60 seconds
- **Block Duration**: Exponential backoff (1 min, 5 min, 30 min)
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Scripts

### Backend
```bash
npm run dev              # Start dev server with hot reload
npm run build           # Build TypeScript to dist/
npm start               # Start production server
npm test                # Run tests
npm run docker:build    # Build Docker image
npm run docker:up       # Start Docker containers
npm run docker:down     # Stop Docker containers
npm run docker:logs     # View Docker logs
```

### Frontend
```bash
npm run dev             # Start dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## Project Structure

```
api-security-gateway/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Entry point
│   │   ├── app.ts             # Express app config
│   │   ├── middleware/        # Middleware functions
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utilities and constants
│   │   ├── types/             # TypeScript interfaces
│   │   └── config/            # Configuration
│   ├── Dockerfile             # Docker image
│   ├── docker-compose.yml     # Multi-container setup
│   └── package.json           # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component
│   │   ├── components/        # React components
│   │   ├── services/          # API service
│   │   ├── hooks/             # Custom hooks
│   │   ├── types/             # TypeScript interfaces
│   │   └── styles/            # CSS files
│   ├── index.html             # HTML template
│   └── package.json           # Dependencies
│
└── README.md                  # This file
```

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### System Status
```bash
curl http://localhost:3000/api/monitor
```

### Rate Limit Status
```bash
curl http://localhost:3000/api/status
```

## Deployment

### Using Docker Compose
```bash
docker-compose -f backend/docker-compose.yml up -d
```

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### Rate Limit Not Working
- Verify Redis is connected: Check backend logs
- Check IP detection: Some proxies may forward different IPs

### Frontend Not Connecting to Backend
- Verify backend is running on port 3000
- Check CORS configuration in `backend/src/app.ts`
- Ensure dev server proxy is configured in `vite.config.ts`

## Contributing

1. Create a feature branch
2. Commit with conventional commit messages
3. Push to origin
4. Create a pull request

## License

MIT
