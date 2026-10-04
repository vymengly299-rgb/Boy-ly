# Boy-ly Trading Signals Platform

## 🚀 AI-Powered Trading Signals Website with Charts, News, and Mobile Alerts

Boy-ly is a comprehensive trading signals platform featuring AI-generated signals, real-time charts, market news, and mobile alerts. Built with a modern full-stack architecture.

## ⚡ Features

### 🎯 Core Features
- **AI-Powered Trading Signals**: Automated signal generation with machine learning
- **Real-Time Charts**: Interactive charts with technical indicators
- **Market News**: Latest news and analysis with sentiment scoring
- **Mobile Alerts**: Push notifications, SMS, and email alerts for trading opportunities
- **Admin Dashboard**: Full content management system
- **User Management**: Authentication, profiles, and permissions

### 📱 Mobile Features
- Responsive design optimized for phones and tablets
- Push notifications for signals and alerts
- Touch-friendly interface
- Offline-capable with service workers

### 📊 Trading Features
- Multiple markets: Crypto, Stocks, Forex, Commodities
- Technical analysis with 20+ indicators
- Signal watchlist and favorites
- Price alerts and notifications
- Risk management tools

### 🎨 Admin Features
- User management (create, edit, deactivate)
- Signal creation and management
- News publishing
- System monitoring
- AI signal generation
- Broadcast notifications
- Analytics and reports

## 🛠 Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** for data storage
- **Mongoose** for ODM
- **JWT** for authentication
- **WebSocket** for real-time updates
- **Twilio** for SMS notifications
- **Nodemailer** for email services

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for data fetching
- **Socket.io** for real-time communication
- **Chart.js** and **ApexCharts** for charts
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### DevOps
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **PM2** for process management
- **Nginx** for reverse proxy

## 📁 Project Structure

```
boy-ly/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration
│   │   └── index.js       # Server entry point
│   └── package.json
│
├── client/                 # Frontend React App
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── common/    # Shared components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── signals/   # Signal components
│   │   │   ├── news/      # News components
│   │   │   ├── charts/    # Chart components
│   │   │   ├── alerts/    # Alert components
│   │   │   ├── dashboard/ # Dashboard components
│   │   │   └── admin/     # Admin components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/     # API services
│   │   ├── context/      # React context
│   │   ├── utils/        # Utility functions
│   │   ├── styles/       # CSS files
│   │   ├── assets/       # Images and assets
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json
│
├── admin/                  # Admin Dashboard (optional)
│   └── ...
│
├── docker-compose.yml     # Docker configuration
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vymengly299-rgb/Boy-ly.git
cd Boy-ly
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Go back to root
cd ..
```

3. **Set up environment variables**

Copy the `.env.example` file to `.env` and update the values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. **Start MongoDB**

Make sure MongoDB is running locally or update the connection string in `server/.env`:
```bash
mongodb://localhost:27017/boy-ly-trading
```

5. **Run the development servers**

```bash
# In one terminal - start the backend
cd server
npm run dev

# In another terminal - start the frontend
cd client
npm start
```

6. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Configuration

### Environment Variables

#### Server (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/boy-ly-trading
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-refresh-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
CLIENT_URL=http://localhost:3000
```

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

### MongoDB Setup

1. Install MongoDB Community Edition
2. Create a database: `boy-ly-trading`
3. The application will automatically create collections on startup

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/refresh-token` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/watchlist` - Get watchlist
- `POST /api/users/watchlist` - Add to watchlist
- `DELETE /api/users/watchlist/:signalId` - Remove from watchlist
- `GET /api/users/favorites` - Get favorites
- `POST /api/users/favorites` - Add to favorites
- `DELETE /api/users/favorites/:symbol` - Remove from favorites

### Signals
- `GET /api/signals` - Get all signals
- `GET /api/signals/:id` - Get signal by ID
- `GET /api/signals/symbol/:symbol` - Get signals by symbol
- `GET /api/signals/market/:market` - Get signals by market
- `GET /api/signals/latest` - Get latest signals
- `GET /api/signals/featured` - Get featured signals
- `POST /api/signals` - Create signal (Admin)
- `PUT /api/signals/:id` - Update signal (Admin)
- `DELETE /api/signals/:id` - Delete signal (Admin)

### News
- `GET /api/news` - Get all news
- `GET /api/news/:id` - Get news by ID
- `GET /api/news/category/:category` - Get news by category
- `GET /api/news/latest` - Get latest news
- `GET /api/news/featured` - Get featured news
- `GET /api/news/breaking` - Get breaking news
- `GET /api/news/search` - Search news
- `POST /api/news` - Create news (Admin)
- `PUT /api/news/:id` - Update news (Admin)
- `DELETE /api/news/:id` - Delete news (Admin)

### Charts
- `GET /api/charts/:symbol` - Get chart data
- `GET /api/charts/:symbol/indicators` - Get indicators
- `GET /api/charts/:symbol/technical-analysis` - Get technical analysis
- `GET /api/charts/markets/:market` - Get market data
- `POST /api/charts/:symbol` - Create/update chart data (Admin)

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `POST /api/alerts/price` - Create price alert
- `POST /api/alerts/signal` - Create signal alert
- `POST /api/alerts/news` - Create news alert

### Admin
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/stats` - Get dashboard stats (Admin)
- `POST /api/admin/notifications/broadcast` - Broadcast notification (Admin)
- `POST /api/admin/ai/generate-signals` - Generate AI signals (Admin)

## 🎨 UI Components

### Common Components
- `Button` - Customizable buttons
- `Card` - Content cards
- `Modal` - Modal dialogs
- `Table` - Data tables
- `Chart` - Interactive charts
- `Form` - Form components
- `Notification` - Toast notifications
- `Badge` - Status badges
- `Avatar` - User avatars
- `Loading` - Loading indicators

### Layout Components
- `Header` - Top navigation header
- `Sidebar` - Left sidebar navigation
- `MobileNavbar` - Bottom navigation for mobile
- `Footer` - Page footer

### Page Components
- `HomePage` - Landing page
- `DashboardPage` - User dashboard
- `SignalsPage` - Signals list
- `SignalDetailPage` - Signal details
- `NewsPage` - News list
- `ChartsPage` - Charts viewer
- `AlertsPage` - Alerts management
- `ProfilePage` - User profile
- `SettingsPage` - User settings

## 🔧 Available Scripts

### Root
```bash
npm run dev          # Start all services (server + client)
npm run build        # Build production bundles
npm run start        # Start production server
```

### Server
```bash
cd server
npm run dev          # Start development server
npm run start        # Start production server
npm run generate      # Generate Prisma client
npm run migrate      # Run database migrations
```

### Client
```bash
cd client
npm start            # Start development server
npm run build        # Build production bundle
npm run test         # Run tests
npm run eject        # Eject from Create React App
```

## 📦 Deployment

### Docker Deployment

1. Build Docker images:
```bash
docker-compose build
```

2. Start containers:
```bash
docker-compose up -d
```

3. Stop containers:
```bash
docker-compose down
```

### Manual Deployment

1. Build the client:
```bash
cd client
npm run build
```

2. Copy the build files to your server:
```bash
cp -r build/ ../server/public/
```

3. Start the server:
```bash
cd server
npm start
```

4. Use PM2 for production:
```bash
npm install -g pm2
pm2 start server/src/index.js --name boy-ly-trading
pm2 save
pm2 startup
```

## 🤖 AI Integration

The platform supports AI-powered features:

- **Signal Generation**: AI analyzes market data and generates trading signals
- **Technical Analysis**: AI provides trend, momentum, and volatility analysis
- **News Summarization**: AI summarizes news articles
- **Sentiment Analysis**: AI analyzes news sentiment

To enable AI features:
1. Set `AI_ENABLED=true` in server `.env`
2. Configure your AI API key and endpoint
3. Use the `/api/admin/ai/generate-signals` endpoint to generate signals

## 📱 Mobile Alerts

The platform supports multiple alert types:

- **Price Alerts**: Trigger when price reaches certain level
- **Signal Alerts**: Trigger on new signals
- **News Alerts**: Trigger on breaking news
- **Custom Alerts**: User-defined conditions

Alerts can be delivered via:
- Push notifications (Web Push API)
- Email
- SMS (via Twilio)
- Webhooks

## 👥 User Roles

- **User**: Regular users can view signals, news, charts, and manage their alerts
- **Admin**: Can manage users, create signals and news, view reports
- **SuperAdmin**: Full access including system settings and user management

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- Helmet for security headers
- CORS configuration
- Input validation
- CSRF protection (recommended for production)

## 📈 Performance Optimization

- Redis caching (recommended)
- Database indexing
- Query optimization
- Image optimization
- Code splitting
- Lazy loading
- Service workers for offline support

## 🐛 Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**
   - Make sure MongoDB is running
   - Check the connection string in `.env`
   - Verify MongoDB is accessible from your application

2. **JWT errors**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration times
   - Verify token storage in localStorage

3. **CORS errors**
   - Check `CLIENT_URL` in server `.env`
   - Verify CORS middleware configuration
   - Ensure client and server are on the same domain in production

4. **WebSocket connection issues**
   - Check WebSocket URL in client `.env`
   - Verify WebSocket server is running
   - Check firewall settings

## 📚 API Documentation

Full API documentation is available in the `/docs` folder (coming soon).

### Request Format

All API requests should include:
- `Content-Type: application/json` header
- `Authorization: Bearer <token>` header for protected routes

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "count": 10,
  "total": 100,
  "pages": 10,
  "currentPage": 1
}
```

### Error Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Error message",
  "status": 404
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- React and the amazing React community
- Tailwind CSS for rapid styling
- MongoDB for flexible data storage
- All the open-source libraries used in this project

## 📞 Support

For support, questions, or feature requests:
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for traders and developers**

*Boy-ly Trading Signals Platform - 2024*
