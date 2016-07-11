'use strict';

const L = require('../src/index');

describe('A testcase built with the Legion convenience library', function() {
  it('instruments whole-testcase completions', function(done) {
    L.run(5, L.of()).metrics().then(function(result) {
      expect(result.tags.testcaseCompletion.run.values.duration.$avg.size).toBe(5);
      done();
    }).catch(function(err) {
      done.fail(err);
    });
  });

  it('can log the output', function(done) {
    L.run(5, L.get()).log().then(function(result) {
      expect(result.tags.testcaseCompletion.run.values.duration.$avg.size).toBe(5);
      done();
    }).catch(function(err) {
      done.fail(err);
    });
  });

  it('has access to the Io\'s embedded state', function(done) {
    L.run(5, L.get().chain(function(receiver) {
      expect(typeof receiver.receive).toBe('function');
      done();
    })).metrics().catch(function(err) {
      done.fail(err);
    });
  });

  it('catches all errors', function(done) {
    L.run(5, L.of().chain(function() { throw 'expected failure'; })).metrics().then(function(result) {
      expect(result.tags.everything.everything.problems.problems$sum).toBe(5);
      done();
    }).catch(function(err) {
      done.fail(err);
    });
  });
});

describe('A testcase built with the Legion object', function() {
  it('runs before and after scripts', function(done) {
    let before_side_effect = false;
    let after_side_effect = false;

    L.create()
     .before(() => { before_side_effect = true; })
     .after(() => { after_side_effect = true; })
     .testcase(L.of()
       .chain(() => expect(before_side_effect).toBe(true))
       .chain(() => expect(after_side_effect).toBe(false)))
     .run(20).metrics()
       .then(() => expect(before_side_effect).toBe(true))
       .then(() => expect(after_side_effect).toBe(true))
       .then(done)
       .catch(done.fail);
  });
});
