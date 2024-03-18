const mongoose = require("mongoose");
const { Schema } = mongoose;


const catagorySchema = new Schema({
    Catagory:{
        type:String,
    required:true,
    unique:[true, "Catagory already present"]
   },
})

const Catagory = new mongoose.model('Catagory',catagorySchema );

module.exports = Catagory;