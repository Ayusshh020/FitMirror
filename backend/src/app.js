const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const env = require('./config/env');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Express Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FitMirror API Service is running' });
});

// API Routes
app.use('/api', routes);

// Swagger UI — available at /api-docs (does not conflict with any /api route)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'FitMirror API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
