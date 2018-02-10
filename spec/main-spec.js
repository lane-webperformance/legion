'use strict';

const L = require('../src/index');
const process = require('process');

describe('The main method', function() {
  it('executes a testcase', function(done) {
    let side_effect = false;

    const testcase = L.create()
      .withTestcase(L.of()
        .chain(() => { side_effect = true; }));

    testcase.main(['node','unit-test.js','-n','1']).then(() => {
      expect(side_effect).toBe(true);
      done();
    }).catch(done.fail);
  });

  it('sets the exit code', function(done) {
    const testcase = L.create()
      .withBeforeTestAction(() => { throw new Error('expected error'); })
      .withTestcase(L.of());

    testcase.main().then(err => {
      expect(err.message).toEqual('expected error');
      expect(process.exitCode).toBe(1);
      process.exitCode = undefined;
    }).then(done).catch(done.fail);
  });
});
