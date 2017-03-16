'use strict';

const metrics = require('legion-metrics');
const control = require('legion-control');

module.exports = function(options) {
  options = options || {};

  const services = {};
  services.legion = {};

  // services.legion.metrics_target
  services.legion.metrics_target = options.metricsTarget || metrics.Target.create(metrics.merge);

  // services.metrics
  services.metrics = services.legion.metrics_target.receiver().tag(metrics.tags.generic('everything', 'everything'));

  // services.control
  services.control = options.control || control.clients.local.create();

  return services;
};
