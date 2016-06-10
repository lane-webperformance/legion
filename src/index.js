'use strict';

const Io = require('legion-io');
const R = require('ramda');
const main = require('./main');

const Legion = {
  _before : () => Promise.resolve(),
  _after : () => Promise.resolve(),
  _testcase : null
};

Legion.before = function(f) {
  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _before : R.composeP(f, this._before)
  });
};

Legion.after = function(f) {
  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _after : R.composeP(f, this._after)
  });
};

Legion.testcase = function(tc) {
  return Object.assign(Object.create(Legion), this, {
    _testcase : tc
  });
};

Legion.run = function(n) {
  return module.exports.run(n, this._testcase, { before: this._before, after: this._after });
};

Legion.main = function() {
  return main(this);
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

