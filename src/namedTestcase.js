'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');
const instrument = require('legion-instrument');

module.exports = function(name, testcase) {
  testcase = Io.of().chain(testcase);
  testcase = instrument(testcase, metrics.tags.generic('testcaseCompletion', name));

  return Io.localPath(['services','metrics'], receiver => receiver.tag(metrics.tags.generic('testcase', name)), testcase);
};

