'use strict';

const L = require('../src/index');

const defaultServices = require('../src/defaultServices');

describe('The run method', function() {
  it('instruments whole-testcase completions', function(done) {
    L.run({name:'jasmine_testcase', users:5, addGlobalState : defaultServices.withServices(defaultServices)}, L.of()).assert().then(function(result) {
      expect(result.tags.testcaseCompletion.jasmine_testcase.values.duration.$avg.size).toBe(5);
    }).then(done).catch(done.fail);
  });

  it('has access to the Io\'s embedded state', function(done) {
    L.run({users:5, addGlobalState : defaultServices.withServices(defaultServices)}, L.get().chain(function(state) {
      expect(typeof state.services.metrics.receive).toBe('function');
    })).assert()
       .then(done)
       .catch(done.fail);
  });

  it('catches all errors', function(done) {
    L.run({name:'jasmine_testcase',users:5, addGlobalState : defaultServices.withServices(defaultServices)}, L.of()
      .chain(function() { throw 'expected failure'; })).metrics().then(function(result) {
        expect(result.tags.everything.everything.problems.problems$sum).toBe(5);
        expect(result.tags.testcase.jasmine_testcase.tags.outcome.failure.values.duration.$avg.size).toBe(5);
      }).then(done).catch(done.fail);
  });

  it("doesn't strictly require the default services", function(done) {
    L.run({users:5}, L.of()).assert().then(done).catch(done.fail);
  });
});
