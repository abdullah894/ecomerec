const express = require("express");
const mongoose =require("mongoose");
const ejs = require("ejs");
const bodyParser = require('body-parser');
const router = require("./src/routers/router");
const flash = require('express-flash');
const session = require('express-session');
require("./src/db/dataBaseConnectiom");
const multer = require('multer');
const path = require('path');
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;


// app.use(flash());
app.use(express.static(__dirname + '/public')); 
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
router.use(bodyParser.json())
.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');











app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


