/* eslint-disable no-console */

'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');

module.exports = function(testcase) {
  testcase = Io.of().chain(testcase);

  return Io.get().chain(function(state) {
    const result = testcase.run(state).catch(function(err) {
      console.log(err);
      if( state && state.receive )
        state.receive(metrics.problem(err));
      else
        throw err;
    });

    return Io.resolve(result);
  });
};
