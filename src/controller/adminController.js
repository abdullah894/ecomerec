const express = require("express");
const bcrypt = require("bcryptjs");
const admin = require("../model/adminSchema");
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';
var nodemailer = require('nodemailer');
const CatagorySchema = require('../model/catagorySchema');
const Product = require('../model/productSchema');
const { error, log } = require("console");

const login = (req,res) => {
    res.render("adminLogin");
}
const forgetPassword = (req,res) => {
    res.render("forgotPassword");
}
const signUp = (req,res) => {
    res.render("adminSignUp");
}

const additems = async (req,res) => {
  const categories = await CatagorySchema.find();
  res.render("add-items", { categories });
} 
const adminRegisterion = async (req, res) => {
    // console.log("body =", req.body);
    try {
        const password = req.body.password;
      const confirmPassword = req.body.conformpassword; 
  
      if (password === confirmPassword) {
        const registerUser = new admin({
            FullName: req.body.FullName,
            email: req.body.Email,
        });
  

        const hashedPassword = await bcrypt.hash(password, 10);
        registerUser.password = hashedPassword;
        const registered = await registerUser.save();
        res.status(201).render('login');
      } 
      else 
      { 
        errorMessage = 'Password and confirm password do not match';
        res.send("password not match");
            // req.flash('error', errorMessage);
        // res.redirect('/sign%20up');
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  };

  const loginAdmin = async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
  
      const Admin  = await admin.findOne({ email: email });
      if (!Admin) {
        return res.status(404).send("User not found");
      }
  
      const passwordMatch = await bcrypt.compare(password, Admin.password);
  
      if (passwordMatch) {
      res.render("adminDashboard");
      } else {
        return res.status(401).send("Invalid password");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
//send mail for request password.
  const sendEmail= async (req,res) => {
    const { email } =req.body;
    try
    {
      const matchOlduser = await admin.findOne({ email });
      if(!matchOlduser) {
        return res.json({alert:"User Not Exists!"});
      }
      const otpCode = Math.floor((Math.random()*10000)+1);
      const otpData = await admin.findOneAndUpdate({
        email:req.body.email,
        code:otpCode,
      })
      var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "9f93a806ca5efd",
          pass: "f3d0897940c3d8"
        },
        secure: false,
        tls: {
          ciphers:'SSLv3'
      }
      });
      
      var mailOptions = {
        from: 'info@mailtrap.club',
        to: "abdullahlatif243@gmail.com",
        subject: 'Passoword Reset',
        text: `Your OTP code is: ${otpCode}`,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.render("otp");
  } 
  catch (error){
    console.log(error);
  }
  };

  const otpVerification = async (req, res) => {
  
    try {
    //   console.log("Request body:", req.body);
      const otp = req.body.otp.map(item => item.toString()).join('');
      const data = await admin.findOne({ code: otp }); 
      // console.log("otp =", otp);
      if (data) {
        res.render("recoverPassword");
        const deleteOtp = await admin.updateOne({ $unset: { code: ""}}); 
      } else {
        res.send("Otp did not Match");
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error"); 
    }
  };
  
  const resetPassword = async (req, res) => {
    try {
      const { password, confirmpassword, email } = req.body; 
      // console.log(req.body);
  
      const matchOlduser = await admin.findOne({ email });
  
      if (!matchOlduser) {
        return res.send("User Not Exists!");
      }
  
      if (password === confirmpassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
  
        await admin.findOneAndUpdate({ email: email }, { password: hashedPassword }); 
  
        res.render("login");
      } else {
        res.send("Password and Confirm Password do not match");
      }
    } catch (error) {
      res.send("Error");
      console.log(error);
    }
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      const filePath = uniqueSuffix + fileExtension;
  
      // Store the file path in the request object based on field name
      if (file.fieldname === "frontImage") {
        req.frontImagePath = filePath;
      } else if (file.fieldname === "backImage") {
        req.backImagePath = filePath;
      }
  
      cb(null, filePath);
    },
  });
  
  const upload = multer({ storage: storage });  
  
  const Catogary = async(req,res) => {
    res.render("add-catagory");
  }
  //adding new catagory
  const addCatogary = async (req, res) => {
    try {
      const newCatagory = new CatagorySchema({
        Catagory: req.body.Catagory,
      });
      await newCatagory.save();
      res.status(200).render('adminDashboard');
    } catch (error) {
      console.error('Error saving catagory: ', error);
      res.status(500).send('Internal server error');
    }
  }
  // get All Catagorys
  const getCatagories = async (req, res) => {
    try {
      const allCategories = await CatagorySchema.find();
      res.render("all-catagoryAdmin", { categories: allCategories });
    } catch (error) {
      console.error('Error fetching categories: ', error);
      res.status(500).send('Internal server error');
    }
  };
  // delete catagorys and matching items.
  const deletecatagory = async (req, res) => {
    try {
      const catagoryies = req.params.Catagory;
      const deletedcatagory = await CatagorySchema.findOneAndRemove({ Catagory:catagoryies });
      const findItems = await Product.deleteMany({category:catagoryies});
      res.status(200).render('dashboard');
    } catch (error) {
      console.log(error);
    }
  }
  
  const addNewProduct = async (req,res) => {
    try {
      const { items, ProductName,men,women,kids, color1, color2, color3, color4, Price, Details,newArrivals } = req.body;

  //    QR CODE 16 NUMBER
  const QRCode = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
      // Create a new  Product model
      const newProduct = new Product({
        category: items,
        frontImage: req.frontImagePath,
        backImage: req.backImagePath,
        ProductName,
        Gender:[men,women,kids],
        color1, 
        color2, 
        color3, 
        color4,
        Price,
        Details,
        code: QRCode, 
        newArrivals,
      });
  
      // Save the new product to MongoDB
      await newProduct.save();
  
      res.status(200).render('adminDashboard');
    } catch (error) {
      console.error('Error saving product: ', error);
      res.status(500).send('Fill All fields.'); 
    }
  };

const getAllproducts = async (req,res) => {
const findProducts = await Product.find();
res.render("all-productsAdmin",{ findProducts });
};
//update Product
//Get update Product
const getProduct = async (req, res) => {
  const QR = req.params.code;
  try { 
    const getProduct = await Product.findOne({ code: QR });
//  console.log(getProduct);
    if (!getProduct) {
      return res.status(404).send('Product not found');
    }

    res.render('Update-product', { getProduct });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const updateProduct = async (req, res) => {
  const QR = req.params.code;
  
  try {
    const { ProductName,men,women,kids, color1, color2, color3, color4, Price, Details } = req.body;
    console.log("REQ.BODY=",req.body);
    console.log("qr=",QR);
    const updatedProduct = await Product.findOneAndUpdate(
      { code: QR },
      {
        frontImage: req.frontImagePath,
        backImage: req.backImagePath,
        ProductName,
        Gender:[men,women,kids],
        color1, 
        color2, 
        color3, 
        color4,
        Price,
        Details,
      },
      { new: true }
    );
    await updatedProduct.save();
    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }

    const findProducts = await Product.find();
    res.render('all-products', { findProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const DeleteProduct = async (req,res) => {
  const QR = req.params.code;
  try {
    const deleteOne = await Product.findOneAndRemove({ code: QR });

    const findProducts = await Product.find();
    res.render('all-products', { findProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error removing Product');
  }
}



module.exports = {
    login,
    forgetPassword,
    signUp,
    adminRegisterion,
    loginAdmin,
    sendEmail,
    otpVerification,
    resetPassword,
upload,
Catogary,
addCatogary,
getCatagories,
deletecatagory,
    additems,
    addNewProduct,
    getAllproducts ,
    getProduct,
    updateProduct,
    DeleteProduct,
  };