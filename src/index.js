var Io = require('legion-io');

var Legion = {};

module.exports.of = Io.of;
module.exports.get = Io.get;

module.exports.run = require('./run');
module.exports.namedTestcase = require('./namedTestcase');
module.exports.withConcurrency = require('./withConcurrency');
module.exports.reportingErrors = require('./reportingErrors');

module.exports.create = function() {
  //TODO: this should be expanded into something useful.
  return Object.create(Legion);
};
