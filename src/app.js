const express = require('express');

const app = express();
const port = 3000;

app.use('/',(req,res)=>{
    res.send("Hello from the server:)");
})

app.listen(port,()=>{
    console.log(`Server has been started at port: ${port}`)
})
