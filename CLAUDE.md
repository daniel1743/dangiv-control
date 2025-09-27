# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is **Dan&Giv Control**, a personal finance management web application built with vanilla JavaScript, HTML, and CSS. The app provides expense tracking, financial goals, AI-powered recommendations, and shopping list management with Firebase integration for user authentication and data persistence.

## Architecture

### Core Structure
- **Frontend-only application**: No backend server required for basic functionality
- **Class-based JavaScript**: Main application logic in `FinanceApp` class in `app.js`
- **Firebase integration**: Authentication and Firestore for data persistence
- **Modular design**: Each feature (expenses, goals, shopping) has dedicated methods and UI sections

### Key Files
- `index.html` - Main HTML structure with all UI sections
- `app.js` - Main application logic (~2100 lines, contains `FinanceApp` class)
- `style.css` - Complete styling with CSS custom properties and responsive design
- `firebase-config.js` - Firebase configuration and service initialization
- `documentacion-dangivcontrol.md` - Comprehensive Spanish documentation
- `backend/` - Optional Node.js server for AI API integration
  - `server.js` - Express server with Gemini API endpoints
  - `package.json` - Backend dependencies (express, cors, dotenv, node-fetch)
  - `test-api.js` - API testing utilities
- `.prettierrc.json` - Code formatting configuration

### Application Sections
1. **Dashboard** - Financial overview with charts and statistics
2. **Expenses** - Expense registration and management
3. **Goals** - Financial goal setting and progress tracking
4. **Analysis** - Data visualization and spending analysis
5. **Shopping** - Shopping list management with necessity categorization
6. **Config** - Settings, authentication, and AI-powered onboarding

## Common Development Commands

### Frontend Development
The main application is frontend-only with no package.json in the root:

```bash
# Serve the application locally (choose one)
python -m http.server 8000
# OR
npx http-server .
# OR
php -S localhost:8000

# Then visit http://localhost:8000
```

### Backend Development (Optional)
A Node.js backend server is available in the `backend/` directory for AI API integration:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with API keys
# GEMINI_API_KEY=your_gemini_api_key_here

# Start the backend server
node server.js

# Backend runs on http://localhost:3000
# Test API endpoints
node test-api.js
```

### Git Workflow
When making changes:
```bash
# Check current status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: your feature description"
# OR
git commit -m "fix: your bug fix description"
```

### Code Formatting
Prettier configuration is available:
```bash
# Format code (if prettier is installed globally)
npx prettier --write .
```

### Testing
- No formal test framework configured
- Manual testing in browser developer tools
- Debug mode available by setting `DEBUG_MODE = true` in app.js
- Backend API testing via `backend/test-api.js`

## Key Technologies

- **Vanilla JavaScript ES6+** - No frameworks, uses modern JS features
- **Chart.js** - For data visualization (loaded via CDN)
- **Firebase v11** - Authentication and Firestore database (ES modules)
- **CryptoJS** - For password hashing (loaded via CDN)
- **Font Awesome** - Icons (loaded via CDN)

## Data Architecture

### Local Storage Structure
```javascript
{
  expenses: Array,      // Expense records
  goals: Array,         // Financial goals
  shoppingItems: Array, // Shopping list items
  monthlyIncome: Number,
  securityPasswords: Object, // Hashed passwords for Daniel/Givonik
  lastUpdate: Number
}
```

### Firebase Integration
- Uses Firestore for cloud data synchronization
- Supports both anonymous and authenticated users
- Data structure mirrors localStorage format

## Authentication System

The app has a dual authentication approach:
1. **Internal password system** - For "Daniel" and "Givonik" users with SHA256 hashed passwords
2. **Firebase Auth** - Email/password authentication for cloud sync

Default internal passwords (can be reset):
- Daniel: "1234"
- Givonik: "5678"

## AI Integration

### Current Implementation
- Basic AI recommendations hardcoded in `renderAIRecommendations()`
- Chat interface with dual API support:
  - **Perplexity API** - Direct client-side integration
  - **Gemini API** - Via backend server (recommended for production)
- Backend server provides secure API key handling and model listing

### API Configuration
Frontend (firebase-config.js):
```javascript
const geminiApiKey = 'TU_API_KEY_DE_GEMINI';  // Placeholder
const perplexityApiKey = 'Tpplx-oKfcPhGOZhJr8QYclMVcQTVNEoRo4vsKcrOaaXNpqUDLgHeJ';
```

Backend (.env file):
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
```

### Backend Endpoints
- `GET /api/models` - List available Gemini models
- `POST /api/perplexity` - Proxy for secure API calls
- `POST /api/gemini` - Gemini API chat endpoint (if implemented)

## Features and Components

### Expense Management
- Categories: Alimentación, Transporte, Entretenimiento, Salud, Servicios, Compras, Otros
- Necessity levels: Muy Necesario, Necesario, Poco Necesario, No Necesario, Compra por Impulso
- User attribution: Daniel, Givonik, Otro
- Protected expenses require dual authentication for deletion

### Financial Goals
- Target amount and deadline tracking
- Progress visualization with progress bars
- Notification system for approaching deadlines

### Shopping Lists
- Product management with quantity and necessity flags
- List generation and download functionality
- Checkbox-based selection system

### Data Visualization
- Expense charts by category (doughnut charts)
- User spending comparison (bar charts)
- Necessity analysis charts
- Demo mode with sample data for anonymous users

## Styling System

Uses CSS custom properties for theming:
- Light/dark theme support
- Comprehensive color token system
- Responsive design with mobile-first approach
- Modern UI components with proper accessibility

Key CSS patterns:
- Grid layouts for responsive design
- Flexbox for component alignment
- CSS animations and transitions
- Modal and toast notification systems

## Important Notes

### Security Considerations
- API keys are exposed in client-side code (typical for frontend-only apps)
- Internal password system uses SHA256 (consider stronger hashing for production)
- Firebase security rules should be configured properly

### Browser Compatibility
- Requires modern browser with ES6+ support
- Uses native JavaScript modules (type="module")
- Chart.js and Firebase dependencies from CDN

### Performance
- Large single JavaScript file (~2100 lines)
- Consider code splitting for larger applications
- Image assets referenced but not included in repository

## Development Patterns

### Code Organization
- Single class architecture (`FinanceApp`) in app.js:2100 lines
- Method naming follows camelCase convention
- Spanish language used in UI and some comments
- Comprehensive error handling with toast notifications

### Event Handling
- Event delegation for dynamic content
- Form submission prevention with custom handlers
- Modal management with backdrop click handling

### State Management
- In-memory state in class properties
- localStorage for persistence
- Firebase Firestore for cloud sync
- Automatic data normalization for encoding issues

### Debugging
- Set `DEBUG_MODE = true` in app.js for console logging
- Browser DevTools for frontend debugging
- Firebase console for database inspection
- Network tab for API call monitoring

This application is designed to work immediately without any build process or dependency installation, making it easy to deploy and modify.