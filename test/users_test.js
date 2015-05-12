'use strict';

var chai = require('chai');               // needed for should/expect assertions
var chaiHttp = require('chai-http');      // needed for requests
var expect = chai.expect;
chai.use(chaiHttp);                       // tell chai to use chai-http
var User = require('../models/User.js');  // bring in model constructor to test
var Sql = require('sequelize');
var sql = new Sql('w3_psql_simple','w3_psql_simple', 'foobar', {dialect: 'postgres'});

// Start server for testing
require('../server.js');

describe('Users', function() {
  describe('with existing user', function() {
    // Setup CLEAN Database before each describe block
    var newUser;
    before(function(done) {
      sql.sync({force: true})
        .then(function() {
          User.create({username: 'joe', email: 'joe@joe.com'})
          .then(function(data) {
            newUser = data.dataValues;
            done();
          })
          .error(function(err){
            console.log(err);
            done();
          });
        });
    });

    after(function(done) {
      var userIds;
      sql.sync({force: true})
        .then(function(){
          User.findAll()
            .then(function(data) {
              userIds = [];
              data.forEach(function(elem, index, origArr) {
                userIds.push(elem.id);
                if (data.length -1 === index) {
                  User.destroy({where: {id: userIds}});
                  done();
                }
              });
            });
        });
    });

    describe('GET for a specific user', function() {
      var joe;
      before(function(done) {
        chai.request('localhost:3000')
          .get('/api/users/joe')
          .end(function(err, res) {
            joe = res.body;
            console.log("RES.BODY IS: ", res.body);
            done();
          });
      });
      it('returns the user', function() {
        expect(typeof joe).to.eq('object');
      });
      it('returns the user\'s username', function(){
        expect(joe.username).to.eql('joe');
      });
      it('returns the user\'s  email', function() {
        expect(joe.email).to.eql('joe@joe.com');
      });
    });

    describe('POST', function() {
      it('creates a new user', function(done) {
        chai.request('localhost:3000')
          .post('/api/users')
          .send({username: 'newbie', email: 'new@new.com'})
          .end(function(err, res) {
            expect(err).to.eq(null);
            expect(res.body.username).to.eq('newbie');
            expect(res.body.email).to.eq('new@new.com');
            done();
          });
      });
    });

    describe('PATCH', function() {
      var response;
      before(function(done) {
        chai.request('localhost:3000')
          .patch('/api/users/' + newUser.id)
          .send({email: 'joe@newemail.com'})
          .end(function(err, res) {
            response = res.body;
            done();
          });
      });
      it('updates the user', function() {
        expect(response).to.eq('success');
      });
    });

    describe('DELETE', function() {
      var response;
      before(function(done) {
        chai.request('localhost:3000')
          .del('/api/users/' + newUser.id)
          .end(function(err, res) {
            response = res.body;
            done();
          });
      });
      // Having my POST test above triggers this to be wrong... how fix?
      it('deletes a user', function(done) {
        chai.request('localhost:3000')
          .get('/api/users')
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res.body.length).to.eql(1);
            done();
          });
      });
      it('responds with the message "user removed"', function() {
        expect(response).to.eq('success');
      });
    });
  });


  describe('with NON-existing user', function() {
    before(function(done) {
      var userIds;
      sql.sync({force: true})
        .then(function(){
          User.findAll()
            .then(function(data) {
              if (data.length === 0) done();
              userIds = [];
              data.forEach(function(elem, index, origArr) {
                userIds.push(elem.id);
                if (data.length -1 === index) {
                  User.destroy({where: {id: userIds}});
                  done();
                }
              });
            });
        });
    });

    describe('GET', function() {
      it('returns a blank array', function(done) {
        chai.request('localhost:3000')
          .get('/api/notauser')
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res.body).to.eql({});
            done();
          });
      });
    });
    describe('PATCH', function() {
      it('returns the error message in the body', function(done) {
        chai.request('localhost:3000')
          .patch('/api/users/123456789wrong')
          .send({username: 'thiswillfail'})
          .end(function(err, res) {
            expect(err).to.eq(null);
            expect(res.body.msg).to.eq('internal server error');
            done();
          });
      });
    });
    describe('DELETE', function() {
      it('returns an error message in the body', function(done) {
        chai.request('localhost:3000')
          .del('/api/users/123456789wrong')
          .end(function(err, res) {
            expect(err).to.eq(null);
            expect(res.body.msg).to.eq('internal server error');
            done();
          });
      });
    });
  });
});



























