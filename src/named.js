'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');
const instrument = require('legion-instrument');

function section(section_type, name, testcase) {
  testcase = Io.of().chain(testcase);

  if( name ) {
    testcase = instrument(testcase, metrics.tags.generic(section_type + 'Completion', name));
    testcase = Io.local(receiver => receiver.tag(metrics.tags.generic(section_type, name)), testcase);
  }

  return testcase;
}

module.exports.action = section.bind(undefined, 'action');
module.exports.test = section.bind(undefined, 'test');
module.exports.page = section.bind(undefined, 'page');
module.exports.testcase = section.bind(undefined, 'testcase');
module.exports.section = section.bind(undefined, 'section');
module.exports.transaction = section.bind(undefined, 'transaction');
