
const express = require('express');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const cors = require('cors');

const emailRoutes = require('./routes/emailRoutes');
const templateRoutes = require('./routes/templateRoutes');
const authRoutes = require('./routes/authRoutes')


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use("/api/user", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/templates", templateRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected...")
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

  })
  .catch(err => console.error('MongoDB connection error:', err));






