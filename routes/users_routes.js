'use strict';

var User = require('../models/User'); // Require in model
// can also bring in the models folder and do:  models.User.create...
var Sql = require('sequelize');
var sql = new Sql('w3_psql_simple', 'w3_psql_simple', 'foobar', { dialect: 'postgres' });
var bodyparser = require('body-parser');

// setup function to export; takes express router
module.exports = function(router) {
  router.use(bodyparser.json());  // api will receive JSON


  // R: get user (see user info)
  router.get('/users/:username', function(req, res) {
    var username = req.params.username;  // // BODY EMPTY, PARAMS HAS: username
    sql.sync()
      .then(function(){
        User.find({where: {username: username} })
        .then(function(data) {  // lookup in db
          console.log(data);
          res.json(data);
        })
        .error(function(err) {
          console.log(err);
          res.status(500).json({msg: 'internal server error'});
        });
      });
      // look in user model
  });

  // R: get ALL users
  router.get('/users', function(req, res) {
    sql.sync()
      .then(function() {
        User.findAll()
        .then(function(data) {  // after the findAll, if succes, pass along data
          res.json(data);
        })
        .error(function(err) {  // after findAll, if err, run this
          console.log(err);
          res.status(500).json({msg: 'internal server error'});
        });
      });
  });

  // C: create user
  router.post('/users', function(req, res) {
    // get passed info from req.body & use mongoose to crate a new 'Thing'
    // var newUser = new User(req.body);  // assumes formatting of body is proper
    sql.sync()  // first sync the server
      .then(function() {
        User.create(req.body)   // don't need to specify contents
        .then(function(data) {
          res.json(data);
        })
        .error(function(err){
          console.log(err);
          res.status(500).json({msg: 'internal server error'});
        });
      });
  });

  // U: update user
  router.patch('/users/:id', function(req, res) {

    sql.sync()
      .then(function() {
        User.update(req.body, {where: {id: req.params.id}})
        .then(function(data) {
          res.json(data);   // return data is the id
        })
        .error(function(err) {
          console.log(err);
          res.status(500).json({msg: 'internal server error'});
        });
      });
  });

  // D: destroy user
  router.delete('/users/:id', function(req, res) {
    sql.sync()
      .then(function() {
        User.destroy({where: {id: [req.params.id]}})  // MUST pass array
        .then(function(data) {
          res.json(data);
        })
        .error(function(err) {
          console.log(err);
          res.status(500).json({msg: 'internal server error'});
        });
      });
  });
};








