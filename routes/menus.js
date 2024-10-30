var express = require('express');
var router = express.Router();


const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');

//upload menu teacher
router.post('/', async (req, res) => {

const menu = `./tmp/${uniqid()}.pdf`
const resultMove = await req.files.menuFromFront.mv(menu);

if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(menu);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }
 
  fs.unlinkSync(menu);
 });




module.exports = router;