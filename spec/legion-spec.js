'use strict';

const L = require('../src/index');
const control = require('legion-control');
const metrics = require('legion-metrics');

describe('A testcase built using the Legion builder object', function() {
  it('runs before and after scripts', function(done) {
    let before_side_effect = false;
    let after_side_effect = false;

    L.create()
     .withBeforeTestAction(() => { before_side_effect = true; })
     .withAfterTestAction(() => { after_side_effect = true; })
     .withTestcase(L.of()
       .chain(() => expect(before_side_effect).toBe(true))
       .chain(() => expect(after_side_effect).toBe(false)))
     .run(20).assert()
       .then(() => expect(before_side_effect).toBe(true))
       .then(() => expect(after_side_effect).toBe(true))
       .then(done)
       .catch(done.fail);
  });

  it('knows its project key', function(done) {
    L.create()
     .withProjectKey('jasmine-test-key')
     .withTestcase(L.projectKey()
       .chain(project_key => expect(project_key).toBe('jasmine-test-key')))
     .run(1).assert()
       .then(done)
       .catch(done.fail);
  });

  it('can have a custom control client', function(done) {
    const client = control.create({});
    client.putControlData('jasmine-test-key', { five: 5 });

    L.create()
      .withController(client)
      .withProjectKey('jasmine-test-key')
      .withTestcase(L.getControlData()
        .chain(data => expect(data.five).toBe(5)))
      .run(1).assert()
        .then(done)
        .catch(done.fail);
  });

  it('can load control counters from the control service', function(done) {
    const client = control.create({});
    client.putControlData('jasmine-test-key', {});

    L.create()
      .withController(client)
      .withProjectKey('jasmine-test-key')
      .withTestcase(L.getCounters('foo',5)
        .chain(data => expect(data.to).toBe(5)))
      .run(1).assert()
        .then(done)
        .catch(done.fail);
  });

  it('has a user unique id', function(done) {
    const ids = [];

    L.create()
      .withTestcase(L.getUserUniqueID().chain(uuid => {
        expect(ids.includes(uuid)).toBe(false);
        ids.push(uuid);
      })).run(1).assert()
        .then(done)
        .catch(done.fail);
  });

  it('can add custom per-user services', function(done) {
    L.create()
      .withUserService(services => Object.assign(services, { foo : 'bar' }))
      .withTestcase(L.get().chain(state =>
        expect(state.services.foo).toBe('bar')
      )).run(1).assert()
        .then(done)
        .catch(done.fail);
  });

  it('can assign custom MetricsTargets', function(done) {
    let merges = 0;

    L.create()
      .withMetricsTarget(metrics.Target.create(metrics.merge, () => { merges++; }))
      .withTestcase(L.of())
      .run(1).assert()
        .then(() => expect(merges).toBe(1))
        .then(done)
        .catch(done.fail);
  });
});
