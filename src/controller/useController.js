const express = require("express");
const bcrypt = require("bcryptjs");
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';
var nodemailer = require('nodemailer');
const product = require('../model/productSchema');
const Catagory = require('../model/catagorySchema');
const Cart = require('../model/cartSchema');
const { Stripe, loadStripe } = require("@stripe/stripe-js");

const mainPage = async (req,res) => {
    const allCategories = await Catagory.find();
    const cartItems = await Cart.find();
        const cartDetails = [];

        for (const item of cartItems) {
            const foundProduct = await product.findOne({ code: item.productCode });

            if (foundProduct) {
                const totalPrice = foundProduct.Price * item.quantity;

                cartDetails.push({
                    productCode: item.productCode,
                    quantity: item.quantity,
                    ProductName: foundProduct.ProductName,
                    frontImage: foundProduct.frontImage,
                    Price: foundProduct.Price,
                    totalPrice

                });
            }
        }
    res.render("mainPage", { categories: allCategories,cartDetails });
}

const Product = async (req,res) => {
    try{
const getAllproducts =  await product.find();
const allCategories = await Catagory.find();
res.render("allProductsUser",{ getAllproducts, categories: allCategories });
    }
    catch(error) {
console.log(error);
res.send("Internal Server Error");
    }
}

const findProduct = async (req, res) => {
    try {
        const category = req.params.category; 
        const products = await product.find({ category: category });
        const allCategories = await Catagory.find();

        res.render("product", { products, categories: allCategories });
    } catch (error) {
        // Handle errors here
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const ProductView = async (req,res) =>  {
    try {
        const productCode = req.params.code;
        const showProduct = await product.findOne({code: productCode});
        const allCategories = await Catagory.find();
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.render("productViewuser", { showProduct, categories: allCategories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
const addToCart = async (req, res) => {
    try {
        const productCode = req.params.code;
        const foundProduct = await product.findOne({ code: productCode });

        if (!foundProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product is already in the cart
        const existingCartItem = await Cart.findOne({ productCode: foundProduct.code });

        if (existingCartItem) {
            // If it's in the cart, increment the quantity
            existingCartItem.quantity += 1;
            await existingCartItem.save();
        } else {
            // If it's not in the cart, create a new cart item
            const addProductToCart = new Cart({
                productCode: foundProduct.code,
                quantity: 1, // Default quantity is 1
            });

            await addProductToCart.save();
        }

        res.redirect("/allProducts");
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
// view your cart items
const cartView = async (req, res) => {
    try {
        const cartItems = await Cart.find();
        const allCategories = await Catagory.find();
        const cartDetails = [];
        let totalProductsInCart = 0;

        for (const item of cartItems) {
            const foundProduct = await product.findOne({ code: item.productCode });

            if (foundProduct) {
                const totalPrice = foundProduct.Price * item.quantity;

                cartDetails.push({
                    productCode: item.productCode,
                    quantity: item.quantity,
                    ProductName: foundProduct.ProductName,
                    frontImage: foundProduct.frontImage,
                    Price: foundProduct.Price,
                    totalPrice

                });
                totalProductsInCart += item.quantity; 
            }
        }
        console.log(totalProductsInCart);
        res.render('userCart', { cartDetails,categories: allCategories });
    } catch (error) {
        console.log(error);
    }
};
// delete product from cart
const deleteProductfromCart = async (req, res) => {
    try {
        const productCode = req.params.code;
        const product = await Cart.findOneAndDelete({ productCode: productCode }); // Assuming 'productCode' is the field to match
        if (!product) {
            return res.send("Product Not Found");
        }
        res.redirect("/api/viewCart");
    } catch (error) {
        console.error(error);
        res.send("Error deleting product from the cart");
    }
}

const stripe = require('stripe')('sk_test_51Op4XZH2eRK4HtlBMOdGL4DggpLMrSqjHVGn5OugyZjqFVWuu89S21QWwZkPH831CZTbXWplxHeSjgRXRYZjsVgV00ltH63rRR');


// ... (other routes and configurations)

const checkout = async (req, res) => {
    const totalAmount = req.body.totalAmount;

    try {
        console.log('Total Amount:', totalAmount);

        // Ensure totalAmount is a valid number
        if (isNaN(totalAmount)) {
            throw new Error('Invalid totalAmount');
        }

        // Create a Checkout Session with the specified amount and currency
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // Update with your preferred currency
                        product_data: {
                            name: 'Your Product Name', // Replace with your actual product name
                        },
                        unit_amount: Math.round(totalAmount * 100), // Convert amount to cents
                    },
                    quantity: 1, // Assuming one unit for this example
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success', // Replace with your success URL
            cancel_url: 'http://localhost:3000/cancel', // Replace with your cancel URL
        });

        // If the session creation is successful, respond with the session ID
        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating Checkout Session:', error);
        res.status(500).json({ success: false, message: 'Checkout failed.' });
    }
};




module.exports = {
mainPage,
Product,
findProduct,
ProductView,
addToCart,
cartView,
deleteProductfromCart,
checkout,
};