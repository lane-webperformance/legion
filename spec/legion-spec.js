var L = require('../src/index');

describe('A testcase built with the Legion convenience library', function() {
  it('is sane', function(done) {
    L.run(5, L.of()).result().then(function(result) {
      expect(result.tags.testcaseCompletion.run.count$sum).toBe(5);
      done();
    }).catch(function(err) {
      done.fail(err);
    });
  });

  it('can log the output', function(done) {
    L.run(5, L.of()).log().then(function(result) {
      expect(result.tags.testcaseCompletion.run.count$sum).toBe(5);
      done();
    }).catch(function(err) {
      done.fail(err);
    });
  });

  it('has access to the Io\'s embedded state', function(done) {
    L.run(5, L.get().chain(function(receiver) {
      expect(typeof receiver.receive).toBe('function');
      done();
    })).result().catch(function(err) {
      done.fail(err);
    });
  });

  it('catches all errors', function(done) {
    L.run(5, L.of().chain(function() { throw 'oops!'; })).result().then(function(result) {
      expect(result.tags.everything.everything.problems$sum).toBe(5);
      done();
    }).catch(function(err) {
      done.fail(err);
    });
  });
});
