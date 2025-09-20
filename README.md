# AI Train Traffic Control Prototype

A comprehensive, security-first AI decision-support system for optimizing railway traffic control with real-time conflict detection, intelligent recommendations, and human-in-the-loop supervision.

![Dashboard View](./public/screenshots/dashboard.png)

## 🚀 Overview

This prototype demonstrates an advanced AI-powered train traffic management system that combines real-time simulation, conflict detection, and intelligent optimization algorithms. The system provides controllers with actionable recommendations while maintaining human oversight through a supervisor approval workflow.

### Key Features

- **Real-time Train Simulation**: Dynamic train movement with realistic physics and conflict detection
- **AI-Powered Optimization**: Intelligent algorithms for traffic flow optimization and conflict resolution
- **Human-in-the-Loop Control**: Supervisor approval system for critical decisions
- **Live Dashboard**: Real-time monitoring with KPIs, maps, and activity logs
- **WebSocket Communication**: Low-latency real-time updates
- **Audit Trail**: Comprehensive logging of all system actions
- **Responsive UI**: Modern, mobile-friendly interface built with Next.js and Tailwind CSS

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router  │  React Components  │  WebSocket Client   │
│  - Dashboard         │  - Live Map        │  - Real-time Updates│
│  - Controller Panel  │  - KPI Cards       │  - Event Streaming  │
│  - Supervisor Queue  │  - Activity Log    │                     │
│  - Audit Log         │  - Train Controls  │                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes  │  Proxy Layer      │  CORS Middleware    │
│  - /api/proxy/*      │  - Backend Proxy  │  - Security Headers │
│  - /api/health       │  - Request Routing│  - Rate Limiting    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Services                        │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Server      │  WebSocket Handler │  AI Logic Engine   │
│  - REST Endpoints    │  - Real-time Comm  │  - Conflict Detection│
│  - Authentication    │  - Client Mgmt     │  - Optimization     │
│  - Request Validation│  - Event Broadcasting│  - Recommendations │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Data Access
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL          │  Redis Cache      │  In-Memory Simulator│
│  - Audit Logs        │  - Session Store  │  - Train Positions  │
│  - User Data         │  - Real-time Data │  - Track Status     │
│  - System Config     │  - Pub/Sub        │  - Conflict State   │
└─────────────────────────────────────────────────────────────────┘
```

### System Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │ Controller  │    │ Supervisor  │
│ Interface   │    │ Interface   │    │ Interface   │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      │ HTTP/WebSocket   │ HTTP/WebSocket   │ HTTP/WebSocket
      ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                Next.js Frontend Application                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Dashboard  │  │ Controller  │  │ Supervisor  │        │
│  │   Page      │  │    Panel    │  │    Queue    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Live Map   │  │  KPI Cards  │  │ Activity    │        │
│  │ Component   │  │ Component   │  │ Log         │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ API Proxy
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                FastAPI Backend Server                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ REST API    │  │ WebSocket   │  │ AI Logic    │        │
│  │ Endpoints   │  │ Handler     │  │ Engine      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Auth &      │  │ Real-time   │  │ Conflict    │        │
│  │ Validation  │  │ Simulation  │  │ Detection   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Data Operations
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │ Redis       │  │ In-Memory   │        │
│  │ Database    │  │ Cache       │  │ Simulator   │        │
│  │ - Audit     │  │ - Sessions  │  │ - Train     │        │
│  │ - Users     │  │ - Real-time │  │   Positions │        │
│  │ - Config    │  │ - Pub/Sub   │  │ - Tracks    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Train     │    │   Track     │    │  Conflict   │
│  Position   │    │   Status    │    │ Detection   │
│  Updates    │    │  Updates    │    │ Algorithm   │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      │ Real-time        │ Real-time        │ Analysis
      ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                Simulation Engine                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Train       │  │ Track       │  │ Conflict    │        │
│  │ Movement    │  │ Occupancy   │  │ Resolution  │        │
│  │ Logic       │  │ Logic       │  │ Logic       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ AI Processing
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                AI Optimization Engine                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Traffic     │  │ Speed       │  │ Route       │        │
│  │ Flow        │  │ Adjustment  │  │ Optimization│        │
│  │ Analysis    │  │ Algorithm   │  │ Algorithm   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Recommendations
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Recommendation Engine                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Action      │  │ Confidence  │  │ Priority    │        │
│  │ Generation  │  │ Scoring     │  │ Assessment  │        │
│  │ Logic       │  │ Logic       │  │ Logic       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ WebSocket Broadcast
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Real-time Communication                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Position    │  │ KPI         │  │ Event       │        │
│  │ Updates     │  │ Updates     │  │ Notifications│       │
│  │ Broadcast   │  │ Broadcast   │  │ Broadcast   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Components
- **Dashboard** (`app/page.tsx`): Main control center with KPIs, live map, and AI actions
- **Controller Panel** (`app/controller-panel/page.tsx`): Train control interface
- **Supervisor Queue** (`app/supervisor/page.tsx`): Approval workflow management
- **Audit Log** (`app/audit-log/page.tsx`): System activity monitoring
- **Live Map** (`components/map.tsx`): Real-time train position visualization
- **KPI Dashboard** (`components/kpis.tsx`): Performance metrics display

#### Backend Services
- **Main API** (`backend/app/main.py`): FastAPI server with REST endpoints
- **Simulator** (`backend/app/simulator.py`): Real-time train simulation engine
- **AI Logic** (`lib/aiLogic.ts`): Conflict detection and optimization algorithms

#### Data Models
- **Train**: Position, speed, route, priority, status
- **Track**: Start/end coordinates, capacity, speed limits, occupancy
- **Conflict**: Detected conflicts with severity and affected trains
- **Recommendation**: AI-generated actions with confidence scores
- **Audit Entry**: System actions with timestamps and metadata

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for backend development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lokesh-poreddy/AI-train-traffic-control.git
   cd AI-train-traffic-control
   ```

2. **Start the full stack**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - WebSocket: ws://localhost:8000/ws/sim

### Manual Setup (Development)

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

## 🎮 Usage Guide

### Dashboard Features
1. **Live Monitoring**: View real-time train positions and system KPIs
2. **AI Optimization**: Click "Run AI Optimize" to generate traffic recommendations
3. **Conflict Resolution**: Monitor and resolve train conflicts automatically
4. **Activity Tracking**: Review system actions in the activity log

### Controller Workflow
1. Navigate to `/controller-panel` for detailed train control
2. Accept AI recommendations or request supervisor approval
3. Monitor individual train status and control speed/stopping
4. View real-time metrics and system performance

### Supervisor Approval
1. Access `/supervisor` to review pending approval requests
2. Approve or reject AI recommendations with comments
3. Monitor the approval queue for critical decisions
4. Review audit trail for compliance

### System Monitoring
1. Check `/audit-log` for comprehensive system activity
2. Monitor KPIs: Punctuality, Delays, Throughput, Utilization
3. Track safety scores and efficiency metrics
4. Review conflict resolution history

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_WS=ws://localhost:8000/ws/sim
NEXT_PUBLIC_DEMO_MODE=true
```

#### Backend
```bash
DEMO_MODE=true
JWT_SECRET=your-secret-key
OIDC_ISSUER=your-issuer
DATABASE_URL=postgresql://user:pass@localhost:5432/rail_demo
REDIS_URL=redis://localhost:6379
```

### Docker Configuration
- **Frontend**: Node.js 20 Alpine with Next.js
- **Backend**: Python 3.9 with FastAPI and Uvicorn
- **Database**: PostgreSQL 15 with initialization scripts
- **Cache**: Redis 7 Alpine for session management

## 🛡️ Security Features

### Demo Mode Safety
- **Simulated Data Only**: No connection to live railway systems
- **Human Oversight**: All critical actions require supervisor approval
- **Audit Logging**: Complete trail of all system actions
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for secure cross-origin requests

### Production Security Roadmap
- **OT/IT Separation**: Isolated operational technology networks
- **Two-Person Authorization**: Dual approval for critical actions
- **Formal Verification**: Mathematical proof of safety properties
- **SIEM Integration**: Security information and event management
- **SOC Monitoring**: 24/7 security operations center oversight

## 📊 Performance Metrics

### Key Performance Indicators (KPIs)
- **Punctuality**: On-time performance percentage
- **Average Delay**: Mean delay time in minutes
- **Throughput**: Trains per hour capacity
- **Utilization**: Track usage efficiency
- **Safety Score**: Conflict-free operation rating
- **Efficiency Score**: Overall system optimization

### Real-time Monitoring
- **Active Conflicts**: Current conflict count
- **System Load**: Track occupancy percentage
- **Train Status**: Running, stopped, emergency states
- **WebSocket Latency**: Real-time update performance

## 🚀 Deployment


#### Backend (Container Host)
```bash
# Build production image
docker build -f backend/Dockerfile -t ai-train-backend .

# Deploy to your container host (AWS ECS, Google Cloud Run, etc.)
# Update WebSocket URL to wss://your-backend/ws/sim
```

#### Database Setup
```bash
# Initialize PostgreSQL with provided schemas
psql -h localhost -U demo -d rail_demo -f scripts/sql/0001_init.sql
```

### Scaling Considerations
- **Horizontal Scaling**: Multiple backend instances with load balancing
- **Database Optimization**: Connection pooling and query optimization
- **Caching Strategy**: Redis for session and real-time data
- **CDN Integration**: Static asset delivery optimization

## 📚 API Documentation

### REST Endpoints

#### System Status
- `GET /api/health` - System health check
- `GET /api/kpis` - Performance metrics
- `GET /api/system/status` - Comprehensive system status

#### Train Management
- `GET /api/trains` - All train information
- `POST /api/train/{id}/control` - Control individual train
- `GET /api/tracks` - Track status information

#### AI Optimization
- `POST /api/optimize` - Generate AI recommendations
- `GET /api/recommendations/active` - Current recommendations
- `POST /api/recommendation/{id}/accept` - Accept recommendation
- `POST /api/recommendation/{id}/request_supervisor` - Request approval

#### Supervisor Workflow
- `GET /api/approvals/pending` - Pending approval requests
- `POST /api/approval/{id}/approve` - Approve request
- `POST /api/approval/{id}/reject` - Reject request

#### Audit & Monitoring
- `GET /api/audit` - System audit log
- `GET /api/model/version` - AI model information

### WebSocket Events

#### Client → Server
- `subscribe` - Subscribe to real-time updates
- `request_approval` - Request supervisor approval

#### Server → Client
- `positions` - Train position updates
- `recommendations` - New AI recommendations
- `tracks` - Track status updates
- `metrics` - System performance metrics
- `events` - System events and notifications
- `audit` - Audit log entries

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **Frontend**: TypeScript, ESLint, Prettier
- **Backend**: Python, Black formatter, Pylint
- **Testing**: Jest (frontend), Pytest (backend)
- **Documentation**: JSDoc, Python docstrings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**DEMO USE ONLY**: This is a prototype system for demonstration and educational purposes. Do not connect to live railway signaling systems or operational technology without proper safety certifications and regulatory approval.

## 🆘 Support

### Documentation
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Guidelines](./docs/security.md)

### Community
- [GitHub Issues](https://github.com/lokesh-poreddy/AI-train-traffic-control/issues)
- [Discussions](https://github.com/lokesh-poreddy/AI-train-traffic-control/discussions)
- [Wiki](https://github.com/lokesh-poreddy/AI-train-traffic-control/wiki)

### Contact
- **Author**: Lokesh Reddy Poreddy
- **Email**: p.krishnalokeshreddy@gmail.com
- **GitHub**: [@lokesh-poreddy](https://github.com/lokesh-poreddy)
- **Project**: AI Train Traffic Control Prototype
- **Repository**: [https://github.com/lokesh-poreddy/AI-train-traffic-control](https://github.com/lokesh-poreddy/AI-train-traffic-control)

---

**Built with ❤️ for the future of intelligent railway management**
