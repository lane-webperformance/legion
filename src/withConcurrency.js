'use strict';

const Io = require('legion-io');
const uuid = require('uuid');

module.exports = function(concurrency, testcase) {
  if( typeof concurrency !== 'number' )
    throw new Error('The concurrency parameter must be number.');

  if( concurrency <= 0 )
    console.log('warning: concurrency == ' + concurrency); // eslint-disable-line no-console

  return Io.get().chain(state => {
    const results = [];
    testcase = Io.of().chain(testcase);

    for( let user_number = 0; user_number < concurrency; user_number++ ) {
      const user_state = Object.assign({}, state, { 
        services : Object.assign({}, state.services, {
          user : {
            number : user_number,
            uuid : uuid.v4()
          }
        })
      });

      results.push(testcase.run(Object.assign({}, user_state)));
    }

    return Io.resolve(Promise.all(results));
  });
};

