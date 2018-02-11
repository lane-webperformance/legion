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
  { name: 'control-server',          type: Boolean,                                    description: 'self-host a local command & control server' },
  { name: 'control-endpoint',        type: String,  typeLabel: '[underline]{URL}',     description: 'endpoint of remote command & control server' },
  { name: 'control-interval',        type: String,  typeLabel: '[underline]{seconds}', description: 'interval between updating command & control data' },
  { name: 'capture-server',          type: Boolean,                                    description: 'self-host a local metrics capture server' },
  { name: 'capture-endpoint',        type: String,  typeLabel: '[underline]{URL}',     description: 'endpoint of remote metrics capture server' },
  { name: 'capture-interval',        type: Number,  typeLabel: '[underline]{seconds}', description: 'interval between streaming metrics to the capture server' },
  { name: 'help',                    type: Boolean,                                    description: 'print this help message' },
  { name: 'project-key',             type: String,  typeLabel: '[underline]{string}',  description: 'project unique key' },
  { name: 'self-hosted',             tyoe: Boolean,                                    description: 'self-host local command & control and metrics capture servers, and use them; suitable for testing scripts on a single machine' },
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
function main(testcase, argv) {
  const options = cli(cli_option_definitions, { argv });
  let default_number_of_users = 1;

  /* istanbul ignore next */
  if( options.help ) {
    printUsage();
    return;
  }

  if( options['self-hosted']) {
    options['capture-server'] = options['capture-server'] || true;
    options['capture-endpoint'] = options['capture-endpoint'] || 'http://localhost:8510';
    options['control-server'] = options['control-server'] || true;
    options['control-endpoint'] = options['control-endpoint'] || 'http://localhost:8511';
  }

  if( options['capture-server']) {
    default_number_of_users = 0;
    const port = 8510;

    control.server.metrics(control.client.pouchdb.create('metrics-capture-database')).listen(port, function() {
      console.log('legion-capture listening on port ' + port + '.');
    });
  }

  if( options['control-server']) {
    default_number_of_users = 0;
    const port = 8511;

    capture.server.listen(port, function() {
      console.log('legion-control listening on port ' + port + '.');
    });
  }

  if( options['project-key'] )
    testcase = testcase.withProjectKey(options['project-key']);

  /* istanbul ignore next */
  if( options['capture-endpoint'] ) {
    testcase = testcase.withMetricsTarget(capture.Target.create(
      metrics.merge,
      options['capture-endpoint'],
      1000*(options['capture-interval'] || 60),
      { project_key:options['project-key'] }));
  }

  /* istanbul ignore next */
  if( options['control-endpoint'] ) {
    testcase = testcase.withController(control.create({
      endpoint: options['control-endpoint']
    }));
  }

  options.users = typeof options.users === 'number' ? options.users : default_number_of_users;

  return Promise.resolve()
    .then(() => testcase.run(options.users))
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
      if( results.problems )
        throw new Error('Logged ' + results.problems + ' problems.');
    }).catch(err => {
      process.exitCode = 1;
      console.error(err);
      return err;
    });
}

module.exports = main;
