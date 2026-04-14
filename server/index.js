require('dotenv').config();
const connectDB = require('./config/db');
const createApp = require('./app');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required');
    process.exit(1);
}

connectDB();
const app = createApp();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Beakon server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
