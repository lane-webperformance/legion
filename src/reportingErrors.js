/* eslint-disable no-console */

'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');

module.exports = function(testcase) {
  testcase = Io.of().chain(testcase);

  return Io.get().chain(function(state) {
    const result = testcase.run(state).catch(function(err) {
      console.log(err);
      state.services.metrics.receive(metrics.problem(err));
    });

    return Io.resolve(result);
  });
};
