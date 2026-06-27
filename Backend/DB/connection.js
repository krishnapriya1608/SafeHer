const mongoose=require('mongoose')


const mongodb_uri=process.env.mongodb_uri


mongoose.connect(mongodb_uri).then(()=>{
    console.log("DB connected")
})
.catch((err)=>{
    console.log(err)
})

module.exports=mongoose