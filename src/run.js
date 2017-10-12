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

  return testcase.run().then(output => {
    const state = global_state;
    const metrics = (state && state.getMetricsTarget && state.getMetricsTarget()) ? Promise.resolve(state.getMetricsTarget().flush()) : Promise.resolve({});
    const problems = (state && state.getProblemCounter && state.getProblemCounter()) ? state.getProblemCounter().get() : 'no problem counter';

    return metrics.then(m => Object.assign({
      output: output,
      metrics: typeof m === 'undefined' ? {} : m,
      problems: problems
    }));
  }).then(x => JSON.stringify(x))
    .then(x => JSON.parse(x));
};

