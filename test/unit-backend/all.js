'use strict';

const mockery = require('mockery');
const chai = require('chai');

before(function() {
  chai.use(require('chai-shallow-deep-equal'));
  chai.use(require('sinon-chai'));
  chai.use(require('chai-as-promised'));
  this.helpers = {};
});

beforeEach(function() {
  mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
  const depsStore = {
    logger: require('./fixtures/logger-noop'),
    errors: require('./fixtures/errors')
  };
  const dependencies = function(name) {
    return depsStore[name];
  };
  const addDep = function(name, dep) {
    depsStore[name] = dep;
  };

  this.moduleHelpers = {
    modulesPath: __dirname + '/../modules/',
    addDep: addDep,
    dependencies: dependencies
  };
});

afterEach(function() {
  mockery.resetCache();
  mockery.deregisterAll();
  mockery.disable();
});
