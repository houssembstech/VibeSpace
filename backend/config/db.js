const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = "mongodb+srv://houssembstech_db_user:SHjZkVwdLQRVZHUF@vibespace.3kq06ln.mongodb.net/vibespace?retryWrites=true&w=majority&appName=VibeSpace";
    const conn = await mongoose.connect(uri, {
      // Configuration pour éviter les avertissements Mongoose
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
