import express from "express"

const app = express()

app.listen(8080,"0.0.0.0",()=>{
    console.log("running");
})