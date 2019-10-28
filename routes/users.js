var express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
router.use(bodyParser.json());
const cors = require('./cors');

var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

const Users = require('../models/user');


/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });

// router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//   //res.send('respond with a resource');
//   Users.find({})
//         .then((users) => {
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(users);
//         }, (err) => next(err))
//         .catch((err) => next(err));
// });

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Log in Unsuccessfully', err: info});
    }

    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Log in Unsuccessfully', err: 'Could not log in user'});
      }
   
      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Log in Successful!', token: token, userid: req.user._id});
    });
  }) (req, res, next);
});

router.post('/signup', cors.corsWithOptions, function(req, res, next) {
  User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful'});
        });
      });
    }
  }, (err) => next(err))
});


router.get('/checkJWTToken', cors.corsWithOptions, (req, res) =>{
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
    return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});
    }
  }) (req, res);
});


router.get('/profile', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Users.findOne({_id: req.user._id})
        .then((user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
        }, (err) => next(err))
        .catch((err) => next(err));
});


router.put('/profile', cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Users.findByIdAndUpdate(req.user._id, {$set: req.body}, {new: true})
        .then((user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
        }, (err) => next(err))
        .catch((err) => next(err));  
});



module.exports = router;