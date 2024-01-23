const mongoose = require('mongoose');


const DB = 'mongodb+srv://Krishna:Krishna%40112@cluster0.7lmemos.mongodb.net/?retryWrites=true&w=majority'
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));