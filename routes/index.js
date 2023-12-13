const express = require('express');
const router = express.Router();
const db = require("../config/mysql.js");
const conn = db.init();
/* GET home page. */
router
.get('/', (req, res, next) => {
  res.render('index');
})
.get('/register', (req, res)=>{
  res.render('register');
})
.get('/memo', (req, res)=>{
  res.render('memo')
})

module.exports = router;
