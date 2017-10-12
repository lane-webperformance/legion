/* eslint-disable no-console */
'use strict';

const cli = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const capture = (function() {
  try      { return require('legion-capture'); }
  catch(e) { return null;                      }
})();
const control = (function() {
  try      { return require('legion-control'); }
  catch(e) { return null;                      }
})();
const metrics = require('legion-metrics');

const cli_option_definitions = [
  { name: 'control-endpoint',        type: String,  typeLabel: '[underline]{URL}',     description: 'endpoint of control server' },
  { name: 'control-interval',        type: String,  typeLabel: '[underline]{seconds}',     description: 'interval between updating control data' },
  { name: 'capture-endpoint',        type: String,  typeLabel: '[underline]{URL}',     description: 'endpoint of metrics capture server' },
  { name: 'capture-interval',        type: Number,  typeLabel: '[underline]{seconds}', description: 'interval between streaming metrics to the capture server' },
  { name: 'help',                    type: Boolean,                                    description: 'print this help message' },
  { name: 'project-key',             type: String,  typeLabel: '[underline]{string}',  description: 'project unique key' },
  { name: 'users', alias: 'n',       type: Number,  typeLabel: '[underline]{number}',  description: 'the number of concurrent users' }
];

/*
 * Print usage information.
 */
/* istanbul ignore next */
function printUsage() {
  const usage = commandLineUsage([{
    header: 'Run load tests with legion.',
    optionList: cli_option_definitions
  }]);

  console.log(usage);
}

/*
 * Incorporate command line arguments into the specified testcase, and run it.
 *
 * * testcase - the Legion object containing the test configuration.
 */
function main(testcase) {
  const options = cli(cli_option_definitions);

  /* istanbul ignore next */
  if( options.help ) {
    printUsage();
    return;
  }

  if( options['project-key'] )
    testcase = testcase.withProjectKey(options['project-key']);

  /* istanbul ignore next */
  if( options['capture-endpoint'] )
    testcase = testcase.withMetricsTarget(capture.Target.create(
        metrics.merge,
        options['capture-endpoint'],
        1000*(options['capture-interval'] || 60),
        { project_key:options['project-key'] }));

  /* istanbul ignore next */
  if( options['control-endpoint'] ) {
    testcase = testcase.withController(control.create({
      endpoint: options['control-endpoint']
    }));
  }

  options.users = options.users || 1;

  return Promise.resolve()
    .then(() => testcase.run(options.users))
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
      if( results.problems )
        throw new Error('Logged ' + results.problems + ' problems.');
    }).catch(err => {
      process.exitCode = 1;
      console.error(err);
      throw err;
    });
}

module.exports = main;
