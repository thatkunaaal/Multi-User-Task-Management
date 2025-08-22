const express = require('express');
const {validateSignUpData} = require('../utlis/validate');

const app = express();
const port = 3000;

// ******************************************Middleware***************************************
app.use(express.json());

app.post('/signup',(req,res)=>{
    try {
        validateSignUpData(req);
        console.log(req.body);
        res.status(200).json({mesage: "Your account has been successfully created!"});

    } catch (err) {
        res.status(400).json({message: err.message});
    }
    
})


app.listen(port,()=>{
    console.log(`Server has been started at port: ${port}`)
})
