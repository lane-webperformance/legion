'use strict';

const Io = require('legion-io');
const core = require('legion-core');
const main = require('./main');

const Legion = {
  _beforeTestActions : x => Io.of(x),
  _afterTestActions : x => Io.of(x),
  _addGlobalServices : x => Io.of(x),
  _addUserServices : x => Io.of(x),
  _destroyUserServices : x => Io.of(x),
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

  result = result.withUserService( module.addUserService, module.destroyUserService );

  return result;
};

// If an IO action returns undefined, return the original input instead. Otherwise, return the defined result.
function mightBeUndefined(default_value, might_be_undefined) {
  if( might_be_undefined === undefined )
    return default_value;
  else
    return might_be_undefined;
}

function returnOrModify(action) {
  return x => Io.of(x).chain(action).chain(result => Io.of(mightBeUndefined(x,result)));
}

function compose(first,then) {
  return x => Io.of(x).chain(first).chain(returnOrModify(then));
}

Legion.withBeforeTestAction = function(f) {
  if( typeof f !== 'function' )
    throw new Error('not a function: ' + f);

  return Object.assign(Object.create(Legion), this, {
    _beforeTestActions : compose(this._beforeTestActions,f)
  });
};

Legion.withAfterTestAction = function(f) {
  if( typeof f !== 'function' )
    throw new Error('not a function: ' + f);

  return Object.assign(Object.create(Legion), this, {
    _afterTestActions : compose(this._afterTestActions,f)
  });
};

Legion.withGlobalService = function(f) {
  if( typeof f !== 'function' )
    throw new Error('not a function: ' + f);

  return Object.assign(Object.create(Legion), this, {
    _addGlobalServices : compose(this._addGlobalServices,f)
  });
};

Legion.withUserService = function(add, destroy) {
  add = add || (x => Io.of(x));
  destroy = destroy || (x => Io.of(x));

  if( typeof add !== 'function' )
    throw new Error('not a function: ' + add);

  if( typeof destroy !== 'function' )
    throw new Error('not a function: ' + destroy);

  return Object.assign(Object.create(Legion), this, {
    _addUserServices : compose(this._addUserServices,add),
    _destroyUserServices : compose(this._destroyUserServices,destroy)
  });
};

Legion.withMetricsTarget = function(target) {
  return this.withGlobalService(services => services.withMetricsTarget(target));
};

Legion.withController = function(controller) {
  return this.withGlobalService(services => services.withController(controller));
};

Legion.withProjectKey = function(project_key) {
  if( typeof project_key !== 'string' )
    throw new Error('project key must be a string');

  return this.withGlobalService(services => services.withProjectKey(project_key));
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
    addGlobalState : this._addGlobalServices,
    addUserState : this._addUserServices,
    destroyUserState : this._destroyUserServices
  }, this._testcase);
};

Legion.main = function() {
  return main(this);
};

module.exports.create = function() {
  return Object.create(Legion).using(core);  // FIXME: don't automatically include core
};

module.exports.prototype = Legion;
module.exports.of = Io.of;
module.exports.get = Io.get;

module.exports.projectKey = () => Io.get().chain(state => state.getProjectKey());
module.exports.controller = () => Io.get().chain(state => state.getController());

module.exports.getControlData = () => module.exports.projectKey().chain(project_key =>
  module.exports.controller().chain(controller =>
    Io.of(controller.getControlData(project_key))));

module.exports.getCounters = (counter_key, n) => module.exports.projectKey().chain(project_key =>
  module.exports.controller().chain(controller =>
    Io.of(controller.getCounters(project_key, counter_key, n))));

module.exports.getUserUniqueId = () => module.exports.get().chain(state => state.getUserUniqueId());

module.exports.run = require('./run');
module.exports.named = require('./named');
module.exports.reportingErrors = require('./reportingErrors');
module.exports.withConcurrency = require('./withConcurrency');

