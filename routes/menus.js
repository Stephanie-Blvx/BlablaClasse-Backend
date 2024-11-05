var express = require('express');
var router = express.Router();
const Menu = require('../models/menus')

const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');

//upload menu teacher
router.post('/', async (req, res) => {

  const menu = `./tmp/${uniqid()}.pdf`
  const resultMove = await req.files.menuFromFront.mv(menu);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(menu);

  const newMenu = new Menu({
    url:resultCloudinary.secure_url,
    creationDate: new Date(),
  });

  newMenu.save()
    .then(savedMenu => {
      res.json({ result: true, url: resultCloudinary.secure_url });
      //res.json({ success: true, menu: savedMenu });
    })

  } else {
    res.json({ result: false, error: resultMove });
  }

  fs.unlinkSync(menu);
});

//download menu Parent
router.get('/', (req, res) => {
  Menu.findOne() 
    .sort({ creationDate: -1 })
    .then(data => {
      if (data) {
        res.json({ result: true, menu: data });
      } else {
        res.json({ result: false, error: 'No menu found' });
      }
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
});




module.exports = router;