'use strict';

const Io = require('legion-io');

module.exports = function(options, testcase) {
  options = Object.assign({}, {
    concurrency : 1,
    addUserState : (x) => Promise.resolve(x)
  }, options);

  /* istanbul ignore next */
  if( typeof options.concurrency !== 'number' || options.concurrency < 0 )
    throw new Error('The concurrency option must be a positive number.');

  return Io.get().chain(state => {
    const results = [];
    testcase = Io.of().chain(testcase);

    for( let user_number = 0; user_number < options.concurrency; user_number++ ) {
      const user_state = Promise.resolve(state).then(options.addUserState);
      results.push(user_state.then(state => testcase.run(state)));
    }

    return Io.resolve(Promise.all(results));
  });
};

