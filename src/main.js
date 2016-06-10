/* eslint-disable no-console */
'use strict';

const cli = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const cli_option_definitions = [
  { name: 'help',              type: Boolean,                                   description: 'print this help message' },
  { name: 'users', alias: 'n', type: Number,  typeLabel: '[underline]{number}', description: 'the number of concurrent users' }
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
 * Run the load test using the specified options.
 *
 * options.testcase - the path to require() the testcase.
 * options.users - the number of concurrent users.
 */
function main(testcase) {
  const options = cli(cli_option_definitions);

  /* istanbul ignore next */
  if( options.help === null ) {
    printUsage();
    return;
  }

  options.users = options.users || 1;

  return Promise.resolve()
    .then(() => testcase.run(options.users).log())
    .catch(err => {
      process.exitCode = 1;
      throw err;
    });
}

module.exports = main;
