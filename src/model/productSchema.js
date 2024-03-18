const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
    category:{
    type:String,
    required:true
   },
   frontImage: {
    type: String, 
    required: true,
  },
  backImage: {
    type: String, 
    required: true,
  },
   ProductName:{
       type:String,
       required:true,
   },
   Gender: [{
    type: String, 
    default: ['men', 'women', 'kids'],
    require:true,
  }],
   color1: {
    type: String, 
    required:true,
  },
   color2: {
    type: String, 
    required:true,
  },
   color3: {
    type: String, 
    required:true,
  },
   color4: {
    type: String, 
    required:true,
  },
   Price:{
    type:Number,
    required:true,
   },
   Details:{
    type:String,
    required:false,
   },
   code: {
    type: Number,
    required: true,
   },
   newArrivals:{
    type:String,
    required:false,
   }
})


const Product = new mongoose.model('Product',ProductSchema);

module.exports = Product;