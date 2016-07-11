//
// This is an *extremely* simple testcase used to manually exercise the command
// line interface.
//

'use strict';

const L = require('./src');
const instrument = require('legion-instrument');
const metrics = require('legion-metrics');

const exampleWait = instrument.wrap((min,max) => {
  min *= 1000;
  max *= 1000;
  return new Promise((resolve,reject) => {
    setTimeout(resolve, Math.random()*(max-min)+min);
  });
}, metrics.tags.generic('exampleWait', 'exampleWait'));

const exampleTestcase = () => {
  return L.of()
    .chain(() => exampleWait(1,5))
    .chain(() => exampleWait(2,3))
    .chain(() => exampleWait(0.5,15));
}

L.create()
 .testcase(exampleTestcase())
 .main();
