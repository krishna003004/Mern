const mongoose = require('mongoose');
const cors = require('cors');
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const session = require('express-session');
app.use(cookieParser())
const dotenvenv = require("dotenv")
dotenvenv.config({ path: './config.env' })






app.use(express.json());


app.use(require("./routes/route"))

const middleware = (req , res , next)=>{
    console.log('Hello Middleware');
    next();
}




require('./db/connect');


app.use(cors({
    origin: 'http://localhost:3000',
  }));

app.listen(5000 , ()=>{
    console.log("server is running at port 5000");
})