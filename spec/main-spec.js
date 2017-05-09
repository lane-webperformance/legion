'use strict';

const L = require('../src/index');
const process = require('process');

describe('The main method', function() {
  it('executes a testcase', function(done) {
    let side_effect = false;

    const testcase = L.create()
      .withTestcase(L.of()
        .chain(() => { side_effect = true; }));

    testcase.main().then(() => {
      expect(side_effect).toBe(true);
      done();
    }).catch(done.fail);
  });

  it('sets the exit code', function(done) {
    const testcase = L.create()
      .withBeforeTestAction(() => { throw new Error('expected error'); })
      .withTestcase(L.of());

    testcase.main().then(done.fail).catch(() => {
      expect(process.exitCode).toBe(1);
      process.exitCode = undefined;
      done();
    });
  });
});
