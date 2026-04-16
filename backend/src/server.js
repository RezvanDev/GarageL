const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const globalErrorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { protect, restrictTo } = require('./middleware/authMiddleware');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1) MIDDLEWARES
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://nexaicall.space',
    'https://www.nexaicall.space',
    'https://nexaicall.space:8443',
    'https://www.nexaicall.space:8443',
    process.env.ALLOWED_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (
            allowedOrigins.includes(origin) ||
            origin.includes('ngrok-free.app') ||
            (process.env.ALLOWED_ORIGIN && origin.includes(new URL(process.env.ALLOWED_ORIGIN).hostname))
        ) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} is not allowed by configuration.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true
}));
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Added

// 2) ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/upload', uploadRoutes); // Added

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Garage Backend is running' });
});

// Example protected route for development
app.get('/api/v1/test-admin', protect, restrictTo('admin'), (req, res) => {
    res.json({ message: 'Welcome, Admin!', user: req.user });
});

// 3) UNHANDLED ROUTES
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4) GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

// START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
