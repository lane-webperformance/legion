/* eslint-disable no-console */

var Io = require('legion-io');
var metrics = require('legion-metrics');

module.exports = function(testcase) {
  testcase = Io.of().chain(testcase);

  return Io.get().chain(function(receiver) {
    return testcase.run(receiver).catch(function(err) {
      try {
        receiver.receive(metrics.problem(err));
      } catch(should_not_happen) {
        console.log(should_not_happen);
      }
    });
  });
};
