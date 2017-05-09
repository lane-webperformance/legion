'use strict';

const metrics = require('legion-metrics');
const control = require('legion-control');

const uuid = require('uuid');

/*
 * This function constructs the services object that will become available
 * in the 'services' field of the testcase's state object.
 */
module.exports = function(services) {
  services = services || {};
  services._legion = {};

  // services.legion.metrics_target
  services._legion.metrics_target = metrics.Target.create(metrics.merge);

  // services.metrics
  services.metrics = services._legion.metrics_target.receiver().tag(metrics.tags.generic('everything', 'everything'));

  // services.control
  services.controller = control.clients.local.create();

  // services.project_key
  services.project_key = uuid.v4();

  return Promise.resolve(services);
};

module.exports.user = function(services) {
  return Promise.resolve(Object.assign({}, services, {
    user_unique_id : uuid.v4()
  }));
};

module.exports.withServices = function(f) {
  return state => Promise.resolve(state.services).then(f).then(services => Object.assign({}, state, { services : services }));
};
