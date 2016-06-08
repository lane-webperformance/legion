'use strict';

const withConcurrency = require('../src/withConcurrency');
const Io = require('legion-io');

describe('The withConcurrency function', function() {
  it('executes an Io multiple times in parallel', function(done) {
    const wait = function() {
      return new Promise(function(resolve,_reject) {
        setTimeout(resolve, 500);
      });
    };
    const testcase = Io.of().chain(() => Io.resolve(wait()));
    
    const start = Date.now();
    withConcurrency(5,testcase).run().then(() => {
      expect(Date.now()-start).toBeLessThan(600);
      expect(Date.now()-start).toBeGreaterThan(400);
      done();
    }).catch(done.fail);
  });

  it('does not tolerate invalid arguments', function() {
    expect(() => withConcurrency({},Io.of())).toThrow();
  });
});
