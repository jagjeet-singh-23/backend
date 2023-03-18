const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');
// hiding the JWT_SECRET token
require('dotenv').config({ path: 'routes/.env.local' });
const jwt_secret = process.env.JWT_SECRET;

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
  body('name', 'Name should contain alteast 5 characters').isLength({ min: 5 }),
  body('email', 'Enter a valid E-mail address').isEmail(),
  body('password', 'Password must be alteast 8 characters').isLength({ min: 8 }),
], async (req, res) => {
  // If there are any errors, return BadRequest and error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    const saltRounds = 10;
    let secPassword = req.body.password;
    // Generate a salt to use for the hashing process
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        console.error(err);
      } else {
        // Hash the password using the generated salt
        bcrypt.hash(secPassword, salt, async (err, hash) => {
          if (err) {
            console.error(err);
          } else {
            // Store the hashed password in the database
            secPassword = hash;
            // Create a new user with the hashed password
            const user = await User.create({
              name: req.body.name,
              email: req.body.email,
              password: secPassword,
            });
            const data = {
              id: user.id
            };
            // Send the user data as a JSON response
            const authToken = jwt.sign(data, jwt_secret);
            res.json({ authToken });
          }
        });
      }
    });

  }
  catch (error) {
    // catch server errors, if any,
    console.error(error.message);
    res.status(500).send('Server Error');
  }
})

// ROUTE 2: Authenticate a User. POST "/api/auth/login". No login req
router.post('/login', [
  body('email', 'Enter a valid E-mail address').isEmail(),
  body('password', 'Password cannot be empty').exists(),
], async (req, res) => {
  // If there are any errors, return BadRequest and error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // get the email and password
  const { email, password } = req.body;
  try {
    // if email does not exist then throw an error
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Please enter correct credentials' }] });
    }
    // if password does not exist then throw an error
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Please enter correct credentials' }] });
    }
    // if credentials are valid, send the user id
    const payload = {
      user:{
        id: user.id
      }
    };
    // Send the user data as a JSON response
    const authToken = jwt.sign(payload, jwt_secret);
    res.json({ authToken });
  } catch (error) {
    // catch server errors, if any,
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// ROUTE 3: Get details of logged in user. POST "/api/auth/getuser". Login req
router.post('/getuser', fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    // catch unexpected errors, if any,
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router; 