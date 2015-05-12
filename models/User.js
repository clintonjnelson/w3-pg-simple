'use strict';

// bring in mongoose for db management
var Sql = require('sequelize');
var sql = new Sql('w3_psql_simple', 'w3_psql_simple', 'foobar', { dialect: 'postgres' });

// Setup schema via mongoose function & export
var Note = module.exports = sql.define('User', {
  username: Sql.STRING,
  email: Sql.STRING
});

// Make sure to sync note into the database
Note.sync();

// Validations

// Export mongoose model with Name/schema

