// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();



const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));


app.use("/api/emails", emailRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected...")
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

  })
  .catch(err => console.error('MongoDB connection error:', err));






