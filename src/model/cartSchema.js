const mongoose = require("mongoose");
const { Schema } = mongoose;


const cartSchema = new Schema({
    productCode:{
        type:String,
    required:true
   },
   quantity:{
    type:Number,
    required:true,
    default:1,
   },
})

const Cart = new mongoose.model('Cart',cartSchema );

module.exports = Cart;