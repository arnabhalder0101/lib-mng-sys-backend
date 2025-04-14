// import express module
const express = require('express');
const helloRouter = require('./routes/hello');
const authRouter = require('./routes/auth');
const user = require('./models/user')


const mongoose = require('mongoose')


// define the port number the server will listen on 
const PORT = '3000';

// init express --
// create instance of express application 
const app = express();

// mongo DB connection string--
const DB = "mongodb+srv://arnab:library@cluster0.euwjulq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// middleware to register the imported hello route
app.use(express.json())

app.use(helloRouter);
app.use(authRouter);

mongoose.connect(DB).then(()=>{
    console.log('Mongo DB connected')
})

// start the server && listen on the port
app.listen(PORT, "0.0.0.0", function (){
    console.log(`Server is started at ${PORT}`);
});  