const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_URI || 'mongodb+srv://shecan_public:public123@cluster0.lsk3d.mongodb.net/shecan_db?retryWrites=true&w=majority';
        const conn = await mongoose.connect(dbURI);
        console.log(`Database connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Database connection failed: ${error.message}`);
        console.log('⚠️ The application will run using an in-memory fallback database. Submissions will clear on restart.');
    }
};

module.exports = connectDB;
