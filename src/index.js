var Io = require('legion-io');
var R = require('ramda');

var Legion = {
  _before_test : () => Promise.resolve(),
  _after_test : () => Promise.resolve(),
  _testcase : null
};

Legion.beforeTest = function(f) {
  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _before_test : R.composeP(f, this._before_test)
  });
};

Legion.afterTest = function(f) {
  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _after_test : R.composeP(f, this._after_test)
  });
};

Legion.testcase = function(tc) {
  return Object.assign(Object.create(Legion), this, {
    _testcase : tc
  });
};

Legion.run = function(n) {
  return Promise.resolve()
   .then(this._before_test)
   .then(() => module.exports.run(n, this._testcase))
   .then(result => {
     this._after_test();
     return result;
   }, err => {
     this._after_test();
     throw err;
   });
};

module.exports.of = Io.of;
module.exports.get = Io.get;

module.exports.run = require('./run');
module.exports.namedTestcase = require('./namedTestcase');
module.exports.withConcurrency = require('./withConcurrency');
module.exports.reportingErrors = require('./reportingErrors');

module.exports.create = function() {
  return Object.create(Legion);
};
