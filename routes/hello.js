const express = require('express')

const helloRoute = express.Router();

// get method --
helloRoute.get('/hello', (req, res)=>{
    res.send('Hello world!')
});


module.exports = helloRoute;