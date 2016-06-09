/* eslint-disable no-console */

'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');

const withConcurrency = require('./withConcurrency');
const reportingErrors = require('./reportingErrors');
const namedTestcase = require('./namedTestcase');
const beforeAndAfter = require('./beforeAndAfter');

module.exports = function(users, testcase, options) {
  if( !Io.isIo(testcase) )
    throw new Error('parameter \'testcase\' is not an instance of Io');

  options = options || {};
  const target = metrics.Target.create(metrics.merge);

  // Build the testcase into a testcase that implements all of the extra
  // features the user asked for.
  const output = Promise.resolve().then(() =>
    beforeAndAfter(options,
      withConcurrency(users,
        reportingErrors(
          namedTestcase('run', testcase))))
            .run(target.receiver().tag(metrics.tags.generic('everything','everything'))));

  // Stringify to pretty human-readable JSON.
  const metrics_string = output.then(function() {
    return JSON.stringify(target.get(), null, 2);
  });

  return {
    log : function() {
      return output.then(oput => metrics_string.then(json_text => {
        console.log('output:  ' + oput);
        console.log('metrics: ' + json_text);
        return this.metrics();
      })).catch(err => {
        console.log('error:   ' + err);
        throw err;
      });
    },

    //Deprecated because the term 'result' is too generic.
    result : function() {
      return metrics_string.then(JSON.parse);
    },

    //alias for 'result'
    metrics : function() {
      //Stringifying and then re-parsing this result is a good thing, because
      //the internal representation may be some weird intermediates that we
      //might not know how to properly access.
      return metrics_string.then(JSON.parse);
    },

    output : function() {
      return output;
    }
  };
};

