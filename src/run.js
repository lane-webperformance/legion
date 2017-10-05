/* eslint-disable no-console */

'use strict';

const Io = require('legion-io');

const withConcurrency = require('./withConcurrency');
const reportingErrors = require('./reportingErrors');
const named = require('./named');
const beforeAndAfter = require('./beforeAndAfter');

module.exports = function(options, testcase) {
  if( !Io.isIo(testcase) )
    throw new Error('parameter \'testcase\' is not an instance of Io');

  let global_state = undefined;

  // setup default options
  options = Object.assign({
    name : null,
    users : 1,
    beforeTestActions : x => Io.of(x),
    afterTestActions : x => Io.of(x),
    addUserState : x => Io.of(x),
    destroyUserState : x => Io.of(x),
    addGlobalState : x => Io.of(x),
    destroyGlobalState : x => Io.get().chain(s => {
      global_state = s;
      return Io.of(x);
    })
  }, options);

  testcase = named.testcase(options.name, testcase);
  testcase = reportingErrors(testcase);
  testcase = withConcurrency({ concurrency : options.users, addUserState : options.addUserState, destroyUserState : options.destroyUserState }, testcase);
  testcase = beforeAndAfter({ before: options.beforeTestActions, after: options.afterTestActions }, testcase);
  testcase = beforeAndAfter({ before: options.addGlobalState, after: options.destroyGlobalState }, testcase);

  const output = testcase.run();

  // I think I need this here to avoid unhandled promise rejections: TODO: figure out how to not need this
  output.catch(() => console.error('Legion: there was a problem. This message should be followed by additional details.'));

  //TODO: it seems everything after this line could be abstracted out as a destroyGlobalState handler?

  // Stringify to pretty human-readable JSON.
  function createMetricsString() {
    return output.then(() => global_state).then(state => {
      if( state && state.getMetricsTarget && state.getMetricsTarget() )
        return Promise.resolve(state.getMetricsTarget().flush()).then(x => {
          if( typeof x === 'undefined' )
            return JSON.stringify({});
          else
            return JSON.stringify(x, null, 2);
        });

      console.error('MetricsTarget not found in global state. Resulting metrics will be {}.'); // eslint-disable-line no-console
      return JSON.stringify({});
    });
  }

  return {
    log : function() {
      return output.then(oput => createMetricsString().then(json_text => {
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
      //
      //TODO: 2017-09-27: this is probably no longer needed
      return createMetricsString().then(x => JSON.parse(x));
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

