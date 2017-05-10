'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');
const R = require('ramda');
const main = require('./main');
const defaultServices = require('./defaultServices');

const Legion = {
  _beforeTestActions : () => Promise.resolve(),
  _afterTestActions : () => Promise.resolve(),
  _addGlobalServices : (x) => Promise.resolve(x),
  _addUserServices : (x) => Promise.resolve(x),
  _testcase : null
};

Legion.using = function(module) {
  let result = this;

  module = module._legion_hooks;

  if( module.beforeTestAction )
    result = result.withBeforeTestAction( module.beforeTestAction );

  if( module.afterTestAction )
    result = result.withAfterTestAction( module.afterTestAction );

  if( module.globalService )
    result = result.withGlobalService( module.globalService );

  if( module.userService )
    result = result.withUserService( module.userService );

  return result;
};

Legion.withBeforeTestAction = function(f) {
  if( typeof f !== 'function' )
    throw new Error('not a function: ' + f);

  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _beforeTestActions : R.composeP(f, this._beforeTestActions)
  });
};

Legion.withAfterTestAction = function(f) {
  if( typeof f !== 'function' )
    throw new Error('not a function: ' + f);

  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _afterTestActions : R.composeP(f, this._afterTestActions)
  });
};

Legion.withGlobalService = function(f) {
  if( typeof f !== 'function' )
    throw new Error('not a function: ' + f);

  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _addGlobalServices : R.composeP(f, this._addGlobalServices)
  });
};

Legion.withUserService = function(f) {
  if( typeof f !== 'function' )
    throw new Error('not a function: ' + f);

  f = R.compose(x => Promise.resolve(x), f);

  return Object.assign(Object.create(Legion), this, {
    _addUserServices : R.composeP(f, this._addUserServices)
  });
};

Legion.withMetricsTarget = function(target) {
  return this.withGlobalService(services => {
    services._legion = services._legion || {};
    services._legion.metrics_target = target;
    services.metrics = services._legion.metrics_target.receiver().tag(metrics.tags.generic('everything', 'everything'));

    return services;
  });
};

Legion.withController = function(controller) {
  return this.withGlobalService(services => {
    services.controller = controller;
    return services;
  });
};

Legion.withProjectKey = function(project_key) {
  if( typeof project_key !== 'string' )
    throw new Error('project key must be a string');

  return this.withGlobalService(services => {
    services.project_key = project_key;
    return services;
  });
};

Legion.withTestcase = function(tc) {
  return Object.assign(Object.create(Legion), this, {
    _testcase : tc
  });
};

Legion.run = function(n) {
  return module.exports.run({
    name : 'run',
    users : n,
    beforeTestActions : this._beforeTestActions,
    afterTestActions : this._afterTestActions,
    addGlobalState : defaultServices.withServices(x => Promise.resolve(x).then(defaultServices).then(this._addGlobalServices)),
    addUserState : defaultServices.withServices(x => Promise.resolve(x).then(defaultServices.user).then(this._addUserServices))
  }, this._testcase);
};

Legion.main = function() {
  return main(this);
};

module.exports.create = function() {
  return Object.create(Legion);
};

module.exports.prototype = Legion;
module.exports.of = Io.of;
module.exports.get = Io.get;

module.exports.projectKey = () => Io.get().chain(state => {
  if( typeof state.services.project_key !== 'string' )
    throw new Error('project_key not defined');

  return state.services.project_key;
});

module.exports.controller = () => Io.get().chain(state => {
  if( typeof state.services.controller !== 'object' )
    throw new Error('controller not defined');

  return state.services.controller;
});

module.exports.getControlData = () => module.exports.projectKey().chain(project_key =>
  module.exports.controller().chain(controller =>
    Io.of(controller.getControlData(project_key))));

module.exports.getCounters = (counter_key, n) => module.exports.projectKey().chain(project_key =>
  module.exports.controller().chain(controller =>
    Io.of(controller.getCounters(project_key, counter_key, n))));

module.exports.getUserUniqueID = () => module.exports.get().chain(state => state.services.user_unique_id);

module.exports.run = require('./run');
module.exports.namedTestcase = require('./namedTestcase');
module.exports.reportingErrors = require('./reportingErrors');
module.exports.withConcurrency = require('./withConcurrency');

