'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');
const instrument = require('legion-instrument');

module.exports = function(name, testcase) {
  testcase = Io.of().chain(testcase);

  if( name ) {
    testcase = instrument(testcase, metrics.tags.generic('testcaseCompletion', name));
    testcase = Io.localPath(['services','metrics'], receiver => receiver && receiver.tag(metrics.tags.generic('testcase', name)), testcase);
  }

  return testcase;
};

