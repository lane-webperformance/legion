'use strict';

const Io = require('legion-io');

module.exports = function(concurrency, testcase) {
  if( typeof concurrency !== 'number' )
    throw new Error('The concurrency parameter must be number.');

  if( concurrency <= 0 )
    console.log('warning: concurrency == ' + concurrency); // eslint-disable-line no-console

  return Io.get().chain(function(receiver) {
    const results = [];
    testcase = Io.of().chain(testcase);

    for( let user_number = 0; user_number < concurrency; user_number++ )
      results.push(testcase.run(receiver));

    return Io.resolve(Promise.all(results));
  });
};

