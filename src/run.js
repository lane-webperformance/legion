/* eslint-disable no-console */

var Io = require('legion-io');
var metrics = require('legion-metrics');

var withConcurrency = require('./withConcurrency');
var reportingErrors = require('./reportingErrors');
var namedTestcase = require('./namedTestcase');

module.exports = function(concurrency, testcase) {
  testcase = Io.of().chain(testcase);
  var target = metrics.Target.create(metrics.merge);

  var result = 
    withConcurrency(concurrency,
      reportingErrors(
        namedTestcase('run', testcase)))
          .run(target.receiver().tag(metrics.tags.generic('everything','everything')));

  result = result.then(function() {
    return JSON.stringify(target.get(), null, 2);
  });

  return {
    log : function() {
      result.then(function(json_text) {
        console.log(json_text);
      });
    },

    result : function() {
      return result.then(function(json_text) {
        return JSON.parse(json_text);
      });
    }
  };
};

