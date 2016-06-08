/* eslint-disable no-console */

'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');

module.exports = function(testcase) {
  testcase = Io.of().chain(testcase);

  return Io.get().chain(function(receiver) {
    const result = testcase.run(receiver).catch(function(err) {
      try {
        console.log(err);
        receiver.receive(metrics.problem(err));
      } catch(should_not_happen) {
        console.log(should_not_happen);
      }
    });

    return Io.resolve(result);
  });
};
