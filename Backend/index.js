const express=require('express')
const cors=require('cors')
const route=require('./Routes/route')


const app=express()

app.use(cors())
app.use(express.json())
app.use('/',route)


const PORT=5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

app.use(()=>{
    console.log(`server is running on port ${PORT}`)
})
