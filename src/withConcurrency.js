'use strict';

const Io = require('legion-io');

const beforeAndAfter = require('./beforeAndAfter');

module.exports = function(options, testcase) {
  options = Object.assign({}, {
    concurrency : 1,
    addUserState : (x) => Io.of(x),
    destroyUserState : (x) => Io.of(x)
  }, options);

  /* istanbul ignore next */
  if( typeof options.concurrency !== 'number' || options.concurrency < 0 )
    throw new Error('The concurrency option must be a positive number.');

  return Io.get().chain(state => {
    const results = [];
    testcase = Io.of().chain(testcase);

    for( let user_number = 0; user_number < options.concurrency; user_number++ )
      results.push(beforeAndAfter({ before: options.addUserState, after: options.destroyUserState }, testcase).run(state));

    return Io.resolve(Promise.all(results));
  });
};

