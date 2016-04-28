var Io = require('legion-io');

module.exports = function(concurrency, testcase) {
  testcase = Io.of().chain(testcase);

  return Io.get().chain(function(receiver) {
    var user_number = 0;
    var results = [];

    for( user_number = 0; user_number < concurrency; user_number++ )
      results.push(testcase.run(receiver));

    return Promise.all(results);
  });
};
