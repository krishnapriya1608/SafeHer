require('dotenv').config()
const express=require('express')
const cors=require('cors')
const userRoutes=require('./Routes/routes')
require('./DB/connection')


const app=express()

app.use(cors())

app.use(express.json())

app.use("/api/user", userRoutes);


const PORT=5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

app.use(()=>{
    console.log(`server is running on port ${PORT}`)
})
