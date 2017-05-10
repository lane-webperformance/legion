/* eslint-disable no-console */

'use strict';

const Io = require('legion-io');

const withConcurrency = require('./withConcurrency');
const reportingErrors = require('./reportingErrors');
const namedTestcase = require('./namedTestcase');
const beforeAndAfter = require('./beforeAndAfter');

module.exports = function(options, testcase) {
  if( !Io.isIo(testcase) )
    throw new Error('parameter \'testcase\' is not an instance of Io');

  // setup default options
  options = Object.assign({
    name : null,
    users : 1,
    beforeTestActions : () => Promise.resolve(),
    afterTestActions : () => Promise.resolve(),
    addGlobalState : x => Promise.resolve(x),
    addUserState : x => Promise.resolve(x)
  }, options);

  const global_state = Promise.resolve({}).then(options.addGlobalState);

  const output = global_state.then(state => {
    return beforeAndAfter({ before : options.beforeTestActions, after : options.afterTestActions },
      withConcurrency({ concurrency : options.users, addUserState : x => Promise.resolve(x).then(options.addUserState) },
        reportingErrors(namedTestcase(options.name, testcase))))
          .run(state);
  });

  // Stringify to pretty human-readable JSON.
  const metrics_string = output.then(() => global_state).then(state => {
    if( ((((state || {}).services || {})._legion || {}).metrics_target || {}).get )
      return JSON.stringify(state.services._legion.metrics_target.get(), null, 2);

    return JSON.stringify({});
  });

  return {
    log : function() {
      return output.then(oput => metrics_string.then(json_text => {
        console.log('output:  ' + oput);
        console.log('metrics: ' + json_text);
        return this.assert();
      })).catch(err => {
        console.log('error:   ' + err);
        throw err;
      });
    },

    metrics : function() {
      //Stringifying and then re-parsing this result is a good thing, because
      //the internal representation may be some weird intermediates that the user
      //might not know how to access programatically.
      return metrics_string.then(JSON.parse);
    },

    output : function() {
      return output;
    },

    assert : function() {
      return this.metrics().then(metrics => {
        if( ((((metrics || {}).tags || {}).everything || {}).everything || {}).problems )
          throw new Error('At least one problem was recorded.');

        return metrics;
      });
    }
  };
};

