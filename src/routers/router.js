const express = require("express");
const router = express.Router();
const Admin= require('../controller/adminController');
const User = require('../controller/useController');
const session = require('express-session');
const multer = require('multer');

//Admin Routes
//Loging-in Admin.
router.get("/AdminLogin",Admin.login);
router.post("/loginAdmin",Admin.loginAdmin);
router.get("/forgetPassword",Admin.forgetPassword);
router.get("/signUp",Admin.signUp);
router.get("/add-item",Admin.additems);
router.get("/addCatogary",Admin.Catogary);
router.get("/AdminallCatagory",Admin. getCatagories);
// saving Admin Details
router.post("/adminRegisterion",Admin.adminRegisterion);
// Loging-in Admin 
router.post("/loginAdmin",Admin.loginAdmin);
//Password-Reset Using Mail
router.post("/sendMail",Admin.sendEmail);
//verifying otp
router.post("/otpVerification",Admin.otpVerification);
//reset password
router.post("/resetPassword",Admin. resetPassword);
//add New Catagory
router.post("/addCatogary",Admin.addCatogary);
//adding New Products
router.post("/addingProducts",Admin.upload.fields([{ name: "frontImage" }, { name: "backImage" }]),Admin.addNewProduct);
//deleting catogries and products
router.get("/deletecatagory/:Catagory",Admin.deletecatagory);
//view all products
router.get("/Adminallproducts",Admin.getAllproducts);
// update product
 router.get("/updateProduct/:code",Admin.getProduct);
 router.post("/updateProduct/:code",Admin.updateProduct);
// Delete product 
router.get("/DeleteProduct/:code",Admin.DeleteProduct)

//User Routes
router.get('/',User.mainPage);
router.get('/allProducts',User.Product);
router.get('/:category',User.findProduct );
// Route to view product details by unique code
router.get('/product/:code', User.ProductView);
// Route to add product to cart by unique code
router.post('/add-to-cart/:code', User.addToCart);
// Route to cart
router.get('/api/viewCart', User.cartView);
// Route to Delete Product From cart
router.get('/deleteitem/:code', User.deleteProductfromCart);
//route to checkout
router.post('/create-checkout-session', User.checkout);



module.exports = router;