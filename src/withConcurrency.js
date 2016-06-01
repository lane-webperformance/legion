var Io = require('legion-io');
var reportingErrors = require('./reportingErrors');

module.exports = function(concurrency, testcase) {
  return reportingErrors(Io.get().chain(function(receiver) {
    var user_number = 0;
    var results = [];
    testcase = Io.of().chain(testcase);

    for( user_number = 0; user_number < concurrency; user_number++ )
      results.push(testcase.run(receiver));

    return Promise.all(results);
  }));
};

