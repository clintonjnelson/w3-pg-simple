'use strict';

var chai = require('chai');               // needed for should/expect assertions
var chaiHttp = require('chai-http');      // needed for requests
var expect = chai.expect;
chai.use(chaiHttp);                       // tell chai to use chai-http
var User = require('../models/User.js');  // bring in model constructor to test

// Point to db via

// Start server for testing
require('../server.js');

describe('Users', function() {
  describe('with existing user', function() {
    // Setup Database before each describe block
    var newUser;
    before(function(done) {
      newUser = User.create({username: 'joe', email: 'joe@joe.com', passtoken: '1234'}, function(err, newUser) {
        done();
      });
    });
    // Drop database after each run
    after(function(done) {
      mongoose.connection.db.dropDatabase(function() {
        done();
      });
    });

    describe('GET for a specific user', function() {
      var joe;
      before(function(done) {
        chai.request('localhost:3000')
          .get('/api/users/joe')
          .end(function(err, res) {
            joe = res.body[0];
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
      it('returns the user\'s  passtoken', function() {
        expect(joe.passtoken).to.eql('1234');
      });
    });

    describe('POST', function() {
      it('does NOT create a duplicate username', function(done) {
        chai.request('localhost:3000')
          .post('/api/users')
          .send({username: 'joe'})
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res.body.msg).to.eql('username already exists - please try a different username');
            done();
          });
      });
    });

    describe('PUT', function() {
      var response;
      before(function(done) {
        chai.request('localhost:3000')
          .put('/api/users/' + newUser.emitted.fulfill[0]._id)
          .send({email: 'joe@newemail.com'})
          .end(function(err, res) {
            response = res.body;
            done();
          });
      });
      it('updates the user', function() {
        expect(response.msg).to.eq('user updated');
      });
    });

    describe('DELETE', function() {
      var response;
      before(function(done) {
        chai.request('localhost:3000')
          .del('/api/users/' + newUser.emitted.fulfill[0]._id)
          .end(function(err, res) {
            response = res.body;
            done();
          });
      });
      // Having my POST test above triggers this to be wrong... how fix?
      it('deletes the user', function(done) {
        chai.request('localhost:3000')
          .get('/api/users/joe')
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res.body).to.eql([]);
            done();
          });
      });
      it('responds with the message "user removed"', function() {
        expect(response.msg).to.eql('user removed');
      });
    });
  });


  describe('with NON-existing user', function() {
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
    describe('POST', function() {
      describe('with no username', function() {
        it('does not create a user', function(done) {
          chai.request('localhost:3000')
            .post('/api/users')
            .send({ username: '', email: 'fail@fail.com' })
            .end(function(err, res) {
              var user = User.find({}, function(err, docs) {
                expect(err).to.eq(null);
                expect(docs.length).to.eq(0);
                done();
              });
            });
        });
        it('returns the validation error message in the body', function(done) {
          chai.request('localhost:3000')
            .post('/api/users')
            .send({username: ''})
            .end(function(err, res) {
              expect(err).to.eq(null);
              expect(res.body.msg).to.include('username');
              expect(res.body.msg).to.include('is required');
              done();
            });
        });
      });
    });
    describe('PUT', function() {
      it('returns the error message in the body', function(done) {
        chai.request('localhost:3000')
          .put('/api/users/123456789wrong')
          .send({username: 'thiswillfail'})
          .end(function(err, res) {
            expect(err).to.eq(null);
            expect(res.body.msg).to.eq('invalid user');
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
            expect(res.body.msg).to.eq('invalid user');
            done();
          });
      });
    });
  });
});



























