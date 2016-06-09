#!/usr/bin/env node

/* eslint-disable no-console */
'use strict';

/*
 * This is the legion command line tool.
 * It simply require()s and runs a testcase.
 */

const cli = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const cli_option_definitions = [
  { name: 'testcase', alias: 't', type: String, defaultOption: true, typeLabel: '[underline]{filepath}', description: 'the testcase to [italic]{require()}' },
  { name: 'users',    alias: 'n', type: Number, typeLabel: '[underline]{number}', description: 'the number of concurrent users' }
];

main();
function main() {
  const options = getOptions();

  if( validateOptions(options) )
    runTest(options);
}

/*
 * Parse the command line options and adjust them into an appropriate format.
 */
function getOptions() {
  const options = cli(cli_option_definitions);

  if( options.testcase && !options.testcase.startsWith('./' ) )
    options.testcase = './' + options.testcase;

  return options;
}

/*
 * Return true if the command line options are correct.
 * Print usage information and return false if there is a problem with the options.
 */
function validateOptions(options) {
  if( !options.testcase || !options.users ) {
    const usage = commandLineUsage([{
      header: 'Run load tests with legion.',
      content: 'The testcase must be a javascript source file that exports a testcase.',
      raw: true
    },{
      header: 'Options',
      optionList: cli_option_definitions
    }]);

    console.log(usage);
    return false;
  }

  return true;
}

/*
 * Run the load test using the specified options.
 *
 * options.testcase - the path to require() the testcase.
 * options.users - the number of concurrent users.
 */
function runTest(options) {
  console.log('running ' + options.testcase + ' with ' + options.users + ' users.');

  let testcase = require(options.testcase);

  // Testcase might be wrapped in a function. Unwrap it.
  while( typeof testcase === 'function' )
    testcase = testcase();

  if( !(testcase.before && testcase.after && testcase.run) )
    throw new Error('not a valid testcase');

  Promise.resolve()
         .then(() => testcase.run(options.users).log())
         .catch(err => {
           console.log(err);
           process.exitCode = 1;
         });
}
