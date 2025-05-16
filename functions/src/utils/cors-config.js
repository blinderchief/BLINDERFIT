/**
 * CORS configuration for Firebase Functions
 * This ensures that your functions can be called from your custom domain
 */
const corsWhitelist = [
  'https://blinderfit.blinder.live',  // Production domain
  'https://blinderfit.web.app',    // Firebase default domain
  'https://blinderfit.firebaseapp.com', // Firebase alternative domain
  'http://localhost:5000',         // Local development
  'http://localhost:5173',         // Vite development server
  'http://localhost:3000'          // Alternative local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, etc)
    if (!origin) return callback(null, true);
    
    if (corsWhitelist.indexOf(origin) !== -1 || origin.endsWith('.blinderfit.web.app')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

module.exports = corsOptions;
